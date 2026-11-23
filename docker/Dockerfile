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

# Every terminal starts with ROS ready to use. Lesson 1 explains what this line does.
RUN echo 'source /opt/ros/jazzy/setup.bash' >> /etc/bash.bashrc

WORKDIR /labs
EXPOSE 7681

# One shell per browser tab that connects. --check-origin refuses connections
# that another web site tries to open to this terminal. disableLeaveAlert stops
# each embedded terminal asking "Leave site?" when the lesson page is left.
CMD ["ttyd", "--writable", "--check-origin", "--port", "7681", "--client-option", "disableLeaveAlert=true", "bash"]
