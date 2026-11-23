import { describe, expect, it } from 'vitest'
import { lesson02 } from '../transcripts'
import {
  INT32,
  STRING,
  connections,
  emptyGraph,
  formatTopicInfo,
  formatTopicList,
  nodeList,
  receivers,
  topicInfo,
  topicList,
  withPublisher,
  withSubscriber,
} from './graph'

// Each block builds the situation one recorded scenario set up in the course
// container, and checks that the model answers the way the real commands did.

const { runs } = lesson02

const talker = withPublisher(emptyGraph(), 'talker', '/chatter', STRING)
const both = withSubscriber(talker, 'listener', '/chatter', STRING)

describe('the model agrees with the recordings: nothing running', () => {
  it('lists no nodes, and only the two topics that are always there', () => {
    expect(nodeList(emptyGraph(), 0).join('\n')).toBe(runs['empty-node-list'].output)
    expect(topicList(emptyGraph(), 0).map((t) => t.topic).join('\n')).toBe(runs['empty-topic-list'].output)
  })
})

describe('the model agrees with the recordings: a talker and a listener', () => {
  it('a topic with a publisher and nobody listening', () => {
    expect(formatTopicInfo(topicInfo(talker, 0, '/chatter'))).toBe(runs['topic-info-one'].output)
    expect(connections(talker)).toHaveLength(0)
  })

  it('once the listener starts', () => {
    expect(nodeList(both, 0).join('\n')).toBe(runs['node-list'].output)
    expect(formatTopicList(topicList(both, 0))).toBe(runs['topic-list'].output)
    expect(formatTopicInfo(topicInfo(both, 0, '/chatter'))).toBe(runs['topic-info'].output)
    expect(connections(both)).toHaveLength(1)
  })

  it('a message published from the terminal reaches the listener too', () => {
    expect(runs['listener-heard'].output).toContain('I heard: [hello from the terminal]')
  })

  it('`ros2 topic echo` counts as a subscription but is not listed as a node', () => {
    const watched = withSubscriber(both, '_ros2cli_echo', '/chatter', STRING, 0, true)
    expect(formatTopicInfo(topicInfo(watched, 0, '/chatter'))).toBe(runs['topic-info-while-echo'].output)
    expect(nodeList(watched, 0).join('\n')).toBe(runs['node-list-while-echo'].output)
    // The real graph has the hidden node, and `ros2 node list -a` shows it.
    expect(runs['node-list-all'].output).toMatch(/^\/_ros2cli_\d+$/m)
  })
})

describe('the model agrees with the recordings: two types on one topic', () => {
  const mixed = withPublisher(both, 'int_publisher', '/chatter', INT32)

  it('the topic is listed once, with both types', () => {
    expect(formatTopicList(topicList(mixed, 0))).toBe(runs['mismatch-list'].output)
    expect(formatTopicInfo(topicInfo(mixed, 0, '/chatter'))).toBe(runs['mismatch-info'].output)
  })

  it('the listener is connected to the publisher of its own type only', () => {
    const [intPublisher] = mixed.publishers.filter((p) => p.type === INT32)
    expect(receivers(mixed, intPublisher)).toHaveLength(0)
    expect(connections(mixed)).toHaveLength(1)
    // In the recording the listener kept hearing strings and never heard the integer.
    expect(Number(runs['mismatch-heard-hello'].output)).toBeGreaterThan(0)
    expect(runs['mismatch-heard-42'].output).toBe('0')
  })

  it('`ros2 topic echo` refuses a topic with two types', () => {
    expect(runs['mismatch-echo'].output).toContain('more than one type')
  })
})

describe('the model agrees with the recordings: two domains', () => {
  const split = withSubscriber(talker, 'listener', '/chatter', STRING, 1)

  it('each domain sees only its own nodes', () => {
    expect(nodeList(talker, 0).join('\n')).toBe(runs['domain0-node-list'].output)
    expect(nodeList(talker, 1).join('\n')).toBe(runs['domain1-node-list'].output)
    expect(topicList(talker, 1).map((t) => t.topic).join('\n')).toBe(runs['domain1-topic-list'].output)
    expect(nodeList(split, 0).join('\n')).toBe(runs['domain0-node-list-after'].output)
    expect(nodeList(split, 1).join('\n')).toBe(runs['domain1-node-list-after'].output)
  })

  it('a listener in another domain hears nothing', () => {
    expect(connections(split)).toHaveLength(0)
    expect(runs['domain1-listener'].output).toBe('')
  })
})

describe('what the lesson says about counting connections', () => {
  const many = (publishers: number, subscribers: number) => {
    let g = emptyGraph()
    for (let i = 0; i < publishers; i++) g = withPublisher(g, `talker_${i}`, '/chatter', STRING)
    for (let i = 0; i < subscribers; i++) g = withSubscriber(g, `listener_${i}`, '/chatter', STRING)
    return g
  }

  it('every publisher connects to every subscription: 3 publishers and 2 subscribers make 6 connections', () => {
    expect(connections(many(3, 2))).toHaveLength(6)
    expect(connections(many(1, 3))).toHaveLength(3)
    expect(connections(many(2, 0))).toHaveLength(0)
  })

  it('one message goes to every subscriber: 1 publisher and 3 subscribers deliver 3 copies', () => {
    const g = many(1, 3)
    expect(receivers(g, g.publishers[0])).toHaveLength(3)
  })

  it('topics with different names never connect, whatever the type', () => {
    const g = withSubscriber(talker, 'listener', '/chatter2', STRING)
    expect(connections(g)).toHaveLength(0)
  })
})
