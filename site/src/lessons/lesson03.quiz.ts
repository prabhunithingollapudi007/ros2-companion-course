import type { Question } from '../components/Quiz'

export const lesson03Quiz: Question[] = [
  {
    prompt: 'Which folder of a workspace do you edit?',
    options: ['src', 'build', 'install', 'log'],
    answer: 0,
    explain: 'src holds your packages. colcon build creates build, install and log from it, and deleting those three is always safe.',
  },
  {
    prompt: 'Where should you run colcon build?',
    options: [
      'In the workspace folder, the one that contains src',
      'Inside src',
      'Inside the package you changed',
      'Anywhere: colcon finds the workspace by itself',
    ],
    answer: 0,
    explain: 'colcon treats the folder it runs in as the workspace. Run it inside src and it puts build, install and log in there, next to your packages.',
  },
  {
    prompt: 'You built a package, but ros2 pkg prefix says "Package not found". What is missing?',
    options: [
      'Sourcing the workspace: source install/setup.bash',
      'Running colcon build a second time',
      'Restarting the container',
      'Adding the package to package.xml',
    ],
    answer: 0,
    explain: 'Building puts the package in install; sourcing install/setup.bash adds that location to the terminal’s AMENT_PREFIX_PATH so ROS can find it.',
  },
  {
    prompt: 'You edit a .cpp file, save it, and run the program again without building. What runs?',
    options: ['The old program, built before your edit', 'The new code, compiled on the fly', 'Nothing: ROS refuses to run outdated programs', 'The old program, with a warning'],
    answer: 0,
    explain: 'ros2 run starts the compiled program in install. Your change reaches it only when colcon build compiles it again.',
  },
  {
    prompt: 'Your code includes a std_msgs header. What must the package declare?',
    options: [
      'std_msgs in package.xml (a depend tag) and in CMakeLists.txt (find_package and ament_target_dependencies)',
      'Only the #include line',
      'std_msgs in package.xml only',
      'std_msgs in CMakeLists.txt only',
    ],
    answer: 0,
    explain: 'package.xml tells colcon and rosdep what the package needs. CMakeLists.txt tells CMake where to find the headers and libraries. Without the CMake lines the compiler fails with "No such file or directory".',
  },
  {
    prompt: 'Your sourced overlay contains a package with the same name as one in /opt/ros/jazzy. Which one does ros2 run use?',
    options: [
      'The overlay’s: the first location in AMENT_PREFIX_PATH that has the package wins',
      'The one in /opt/ros/jazzy, because it was installed first',
      'Whichever was built most recently',
      'ROS reports a conflict and runs neither',
    ],
    answer: 0,
    explain: 'Sourcing a workspace puts its packages in front of what was already there. The package is taken whole from the first location that has it, so programs only the underlay’s copy has become unavailable.',
  },
  {
    prompt: 'What does colcon build --packages-select hello_ros do?',
    options: ['Builds only hello_ros', 'Builds hello_ros and everything that depends on it', 'Creates a new package called hello_ros', 'Deletes and rebuilds hello_ros from scratch'],
    answer: 0,
    explain: 'It limits the build to the named packages. --packages-up-to builds a package together with everything it depends on.',
  },
  {
    prompt: 'Which file tells colcon that a package is built with CMake?',
    options: ['package.xml, in its build_type tag', 'CMakeLists.txt, by existing', 'setup.bash', 'The folder name'],
    answer: 0,
    explain: 'package.xml’s export section says ament_cmake or ament_python. colcon list shows the type it found for each package.',
  },
]
