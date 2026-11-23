import { describe, expect, it } from 'vitest'
import { lesson05 } from '../transcripts'
import { BUILT_IN_TOPICS, CLI_TALKERS, EXAMPLES, withArgs, type Example } from './lesson05'
import { expand, graphNames, normaliseNamespace, resolveNode } from './names'

const lines = (id: string) => lesson05.runs[id].output.split('\n').filter(Boolean)
const own = (topics: string[]) => topics.filter((t) => !BUILT_IN_TOPICS.includes(t))
const names = (example: Example) => graphNames(example.nodes)

describe('the name model agrees with the recordings', () => {
  it('the four talkers renamed and moved on the command line', () => {
    const { nodes, topics } = graphNames(CLI_TALKERS)
    expect(nodes).toEqual(lines('cli-nodes'))
    expect(topics).toEqual(own(lines('cli-topics')))
  })

  it('talk_listen.launch.py', () => {
    expect(names(EXAMPLES.talk_listen).nodes).toEqual(lines('launch-nodes'))
  })

  it('two_pairs.launch.py: one namespace per pair', () => {
    expect(names(EXAMPLES.two_pairs).nodes).toEqual(lines('pairs-nodes'))
    expect(names(EXAMPLES.two_pairs).topics).toEqual(own(lines('pairs-topics')))
  })

  it('renamed.launch.py: new node names and a remapped topic', () => {
    expect(names(EXAMPLES.renamed).nodes).toEqual(lines('renamed-nodes'))
    expect(names(EXAMPLES.renamed).topics).toEqual(own(lines('renamed-topics')))
  })

  it('with_args.launch.py, with its default and with robot:=rover', () => {
    expect(names(withArgs('robot1')).nodes).toEqual(lines('args-default-nodes'))
    expect(names(withArgs('rover')).nodes).toEqual(lines('args-rover-nodes'))
  })

  it('include.launch.py: an included file inside a pushed namespace', () => {
    expect(names(EXAMPLES.include).nodes).toEqual(lines('include-nodes'))
  })
})

describe('the naming rules themselves', () => {
  it('relative, absolute and private names', () => {
    expect(expand('chatter', '/robot1', '/robot1/talker')).toBe('/robot1/chatter')
    expect(expand('/chatter', '/robot1', '/robot1/talker')).toBe('/chatter')
    expect(expand('~/chatter', '/robot1', '/robot1/talker')).toBe('/robot1/talker/chatter')
    expect(expand('chatter', '', '/talker')).toBe('/chatter')
  })

  it('namespaces with or without slashes mean the same', () => {
    expect(normaliseNamespace('robot1')).toBe('/robot1')
    expect(normaliseNamespace('/robot1/')).toBe('/robot1')
    expect(normaliseNamespace('')).toBe('')
    expect(normaliseNamespace('/')).toBe('')
  })

  it('a rule that names another topic does not apply', () => {
    expect(resolveNode({ name: 'talker', topics: ['chatter'], remap: [['news', 'other']] }).topics).toEqual(['/chatter'])
  })
})
