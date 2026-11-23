# The container every lab runs in, and every command a lesson quotes was recorded in.
# ROS 2 Jazzy on Ubuntu 24.04, from the official image, plus the demo nodes the
# lessons use and a web terminal (ttyd) that the lesson pages embed.
FROM ros:jazzy-ros-base

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ros-jazzy-demo-nodes-cpp \
        ros-jazzy-demo-nodes-py \
        ttyd \
    && rm -rf /var/lib/apt/lists/*

# From Lesson 7 on: the robot model tools, RViz, Gazebo and its bridge to ROS,
# keyboard teleoperation, and a desktop in the browser to see the windows they open.
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ros-jazzy-xacro \
        ros-jazzy-robot-state-publisher \
        ros-jazzy-joint-state-publisher \
        ros-jazzy-joint-state-publisher-gui \
        ros-jazzy-rviz2 \
        ros-jazzy-tf2-tools \
        ros-jazzy-tf2-ros \
        ros-jazzy-ros-gz \
        ros-jazzy-teleop-twist-keyboard \
        tigervnc-standalone-server \
        novnc \
        python3-websockify \
        openbox \
        xvfb \
        imagemagick \
        x11-utils \
    && rm -rf /var/lib/apt/lists/*

# check_urdf, which prints a robot model's tree of links (Lesson 7).
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends liburdfdom-tools \
    && rm -rf /var/lib/apt/lists/*

# Every terminal starts with ROS ready to use. Lesson 1 explains what this line does.
RUN echo 'source /opt/ros/jazzy/setup.bash' >> /etc/bash.bashrc

# Windows that programs open appear on the desktop served at port 6080.
ENV DISPLAY=:1
COPY start-course.sh /usr/local/bin/start-course
RUN chmod +x /usr/local/bin/start-course

WORKDIR /labs
EXPOSE 7681 6080

CMD ["start-course"]
