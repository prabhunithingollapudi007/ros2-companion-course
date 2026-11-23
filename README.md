# ROS 2 Companion

A visual, hands-on companion for learning ROS 2 in 17 lessons. It follows ETH
Zurich's [Programming for Robotics - ROS](https://rsl.ethz.ch/education-students/lectures/ros.html)
course (2026 edition, ROS 2 Jazzy) and aims to add what lecture slides cannot:
a figure for every concept, interactive playgrounds that simulate the idea in
the page, quizzes, and labs you do in a ROS 2 container.

> **Unofficial.** This is an independent study aid. It is not affiliated with,
> endorsed by, or produced by ETH Zurich, the Robotic Systems Lab, the lecturers
> of the course, or Open Robotics. The course slides and exercises belong to
> their authors; this project links to them and does not copy or redistribute
> them. All lesson text, figures and code here are original.

It is written for someone who can program in C++ and Python, is comfortable in a
Linux terminal, and has not used ROS.

## Status

**All 17 lessons are written.** Each has figures, playgrounds that simulate the
idea in the page (their models tested against real output), terminal sessions
recorded in the course container, a lab with live terminals (and, from Lesson 7,
the container's desktop) in the page, a checker for the lab and a reference
solution, a quiz and a recap. From Lesson 7 on, the labs build on each other:
the robot of Lesson 7 is simulated in Lesson 9, its stack is put together in
Lesson 13, and the capstone drives it to goals.

## The lessons

| Part | Lessons |
| --- | --- |
| 1. The ROS graph | 1 What ROS is, and your first commands · 2 Nodes, topics and messages |
| 2. Writing ROS programs | 3 Workspaces, packages and the build · 4 Publishers, subscribers and your own messages · 5 Launch files · 6 Bags, time and synchronising topics |
| 3. Robots, frames and simulation | 7 URDF and xacro · 8 TF2 · 9 Simulation with Gazebo |
| 4. Talking to nodes | 10 Services · 11 Actions · 12 Parameters · 13 Designing a robot software stack |
| 5. Under the hood | 14 Discovery and quality of service · 15 Executors and callback groups · 16 Reading and porting ROS 1 code |
| 6. Capstone | 17 Drive a robot to a goal |

Parts 1 to 5 follow the four lecture days of the ETH course. The capstone is
this project's own, because the course's final project exam is not published.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

    npm --prefix site install
    npm --prefix site run dev -- --port 5174

Then open http://localhost:5174. Lessons, figures, playgrounds and quizzes work
straight away. Progress is saved in your browser only.

## Labs: the course container

The labs run in a container with ROS 2 Jazzy on Ubuntu 24.04 (built from the
official `ros:jazzy-ros-base` image), so nothing ROS-related is installed on
your computer. You need [Docker](https://docs.docker.com/get-started/get-docker/).
From this folder:

    docker compose -f docker/compose.yaml up -d --build

The first start builds the image, which takes a while and about 5 GB of disk
(RViz and Gazebo are most of it). While it runs, the lab section of a lesson
shows live terminals inside the container, and http://localhost:7681 is one in
its own tab. From Lesson 7 on, labs also show the container's desktop, where
RViz and Gazebo open their windows; it is http://localhost:6080/vnc.html in a
tab of its own. This is tested with the site running locally. A hosted copy can try
the same, but browsers may ask permission before, or refuse, letting a public
page reach a server on your own computer; the new-tab link works either way. The `labs/` folder is shared with the container as `/labs`. Stop it with:

    docker compose -f docker/compose.yaml down

What it opens on your machine: a web terminal (`ttyd`) on port 7681, refusing
connections that other web sites try to open to it, and a desktop (a VNC server
seen through noVNC) on port 6080. Both are bound to `127.0.0.1` so that only this
computer can reach them. Anyone who can reach those ports has a shell or a desktop
in the container, which is why they are not exposed to the network.

## Recorded terminal sessions

A lesson never quotes a command or its output from memory. The commands each
lesson shows are listed in `site/src/transcripts/lessonNN.scenarios.json`;
`site/scripts/transcripts.mjs` runs each scenario in a fresh copy of the course
container with networking switched off, so nothing else can join the graph being
recorded (via `docker/record.py`), and stores what was printed in
`lessonNN.json`, which the page displays. Tests then hold the lesson text, the playground models and the
lab answers to those recordings.

    npm --prefix site run transcripts            # record again (after changing a scenario)
    npm --prefix site run transcripts:check      # fail if any command now prints something different

Both need Docker and the image built once (`docker compose -f docker/compose.yaml build`).
The check ignores what is expected to change between runs: clock times, generated
ids and, for commands marked so, measured numbers such as rates or the time
stamps of messages. Where output
depends on timing (several processes' lines interleaving, how long discovery took),
a scenario shows it but leaves it out of the check, says why, and checks the same
fact another way. The recorder runs commands without a terminal, so it removes the
one line `ros2 bag` prints only in that case ("stdin is not a terminal device").

Scenarios marked `"display": true` run with a virtual screen (Xvfb), so programs
that open windows, such as RViz, can run; a step `{"screenshot": "name.png"}`
saves the screen to `site/public/shots/`, and a lesson shows it with
`<Screenshot name="name.png" ...>`. When checking, screenshots are taken but not
compared: what a window looks like varies, so only that the programs ran is checked.

## Tests

    npm --prefix site test
    npm --prefix site run lint
    npm --prefix site run build

The build writes a complete HTML page for the home page and for every lesson
(`dist/lesson/1/` to `dist/lesson/17/`), each with its own title and
description, plus `sitemap.xml` and an `llms.txt` summary for AI assistants.
The build fails if any page does not render in full, or if a lesson shows a
terminal session that has not been recorded. CI runs all of this, and the
transcript check in a freshly built container.

## Layout

- `site/` - the website (Vite, React, MDX, KaTeX).
  - `src/course.ts` - the outline, source links, the ROS release and the site's public address.
  - `src/lessons/` - per written lesson: `LessonNN.mdx`, its quiz, its lab questions, and tests for both.
  - `src/components/` - the blocks a lesson is composed from, the terminal, the playground frame and the quiz.
  - `src/figures/` and `src/playgrounds/` - the diagrams and interactive panels, one file or folder per lesson.
  - `src/ros/` - small models of ROS behaviour behind the playgrounds, tested against the recordings.
  - `src/lab/` - the live container terminals and the lab questions.
  - `src/transcripts/` - each lesson's scenarios and the recorded sessions.
  - `src/router.ts` and `src/seo.ts` - page addresses, and what each page tells search engines.
  - `scripts/prerender.mjs` - the build step that writes one HTML page per lesson.
  - `scripts/transcripts.mjs` - records and checks the terminal sessions.
- `docker/` - the course container (`Dockerfile`, `compose.yaml`) and the recorder it runs (`record.py`).
- `labs/` - files the labs use, shared with the container as `/labs`.
- `materials/` - not in the repository. A local copy of the ETH slides and
  exercises for reference while writing; it is ignored by git on purpose.

## Rules for writing a lesson

1. Plan the figures first: one per concept. Write only the text the figures cannot carry.
2. Write `site/src/lessons/LessonNN.mdx` around them, using the blocks in
   `src/components/Blocks.tsx`. A file with that name is picked up automatically;
   add its quiz as `lessonNN.quiz.ts` and its reading time to `LESSON_MINUTES`.
3. Put the logic behind a playground in its own module with tests, so that any
   number or outcome the lesson states is pinned by a test.
4. Never type a command's output into a lesson. Add the command to the lesson's
   scenario file, record it, and show the recording with `<Terminal>`. Output a
   playground computes is marked as simulated, and its model is tested against
   the recordings. The ETH slides are a guide to what to cover, not a source of
   commands to copy.
5. Labs are this project's own tasks. They practise the same skills as the ETH
   exercises but must not be those exercises or their solutions, which are
   graded coursework.

If you host your own copy, set `SITE_URL` in `site/src/course.ts` to its address:
the page addresses given to search engines are built from it.

## Licence

- **Code** (the site, the interactive panels, labs, tests and solutions): [MIT](LICENSE).
- **Course content** (lesson text, quizzes, figures, lab instructions): [CC BY 4.0](LICENSE-CONTENT.md).
  Reuse and adapt it freely, with credit.

Neither licence covers the ETH course materials, which are not part of this repository.

## Credits

- [Programming for Robotics - ROS](https://rsl.ethz.ch/education-students/lectures/ros.html),
  Robotic Systems Lab, ETH Zurich, 2026.
- The [ROS 2 Jazzy documentation](https://docs.ros.org/en/jazzy/index.html) and
  the [Gazebo Harmonic documentation](https://gazebosim.org/docs/harmonic/getstarted/).
- The site is built on the same engine as the
  [Reinforcement Learning Companion](https://github.com/prabhunithingollapudi007/reinforcement-learning-companion-course).

Each lesson's Sources box lists what it draws on. Mistakes in this companion are
its own, not the course's. Corrections are welcome.
