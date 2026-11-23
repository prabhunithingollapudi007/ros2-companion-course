// Reference solution for the Lesson 6 lab. Try the lab before reading it.
#include <cmath>
#include <functional>
#include <memory>

#include "message_filters/subscriber.h"
#include "message_filters/sync_policies/approximate_time.h"
#include "message_filters/synchronizer.h"
#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/relative_humidity.hpp"
#include "sensor_msgs/msg/temperature.hpp"

using sensor_msgs::msg::RelativeHumidity;
using sensor_msgs::msg::Temperature;
using Policy = message_filters::sync_policies::ApproximateTime<Temperature, RelativeHumidity>;

// The Magnus formula, with temperature in degrees Celsius and humidity as a fraction.
double dew_point(double celsius, double humidity)
{
  const double b = 17.62;
  const double c = 243.12;
  const double gamma = std::log(humidity) + b * celsius / (c + celsius);
  return c * gamma / (b - gamma);
}

class DewPoint : public rclcpp::Node
{
public:
  DewPoint()
  : Node("dew_point")
  {
    publisher_ = create_publisher<Temperature>("dew_point", 10);
    temperature_.subscribe(this, "temperature");
    humidity_.subscribe(this, "humidity");
    sync_ = std::make_shared<message_filters::Synchronizer<Policy>>(Policy(10), temperature_, humidity_);
    sync_->registerCallback(
      std::bind(&DewPoint::on_pair, this, std::placeholders::_1, std::placeholders::_2));
  }

private:
  void on_pair(const Temperature::ConstSharedPtr & t, const RelativeHumidity::ConstSharedPtr & h)
  {
    Temperature out;
    out.header = t->header;  // when and where the temperature was measured
    out.temperature = dew_point(t->temperature, h->relative_humidity);
    out.variance = 0.0;
    publisher_->publish(out);
  }

  rclcpp::Publisher<Temperature>::SharedPtr publisher_;
  message_filters::Subscriber<Temperature> temperature_;
  message_filters::Subscriber<RelativeHumidity> humidity_;
  std::shared_ptr<message_filters::Synchronizer<Policy>> sync_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<DewPoint>());
  rclcpp::shutdown();
  return 0;
}
