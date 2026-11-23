from setuptools import find_packages, setup

package_name = 'fleet_demo'

setup(
    name=package_name,
    version='0.1.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages', ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='ROS 2 Companion',
    maintainer_email='noreply@example.com',
    description='Lesson 5 lab: a battery, a monitor and a dashboard for a small fleet.',
    license='MIT',
    entry_points={
        'console_scripts': [
            'battery = fleet_demo.battery:main',
            'monitor = fleet_demo.monitor:main',
            'dashboard = fleet_demo.dashboard:main',
        ],
    },
)
