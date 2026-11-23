// Pairs temperature and humidity readings by their time stamps, and prints each pair.
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

class PairPrinter : public rclcpp::Node
{
public:
  PairPrinter()
  : Node("pair_printer")
  {
    temperature_.subscribe(this, "temperature");
    humidity_.subscribe(this, "humidity");
    sync_ = std::make_shared<message_filters::Synchronizer<Policy>>(Policy(10), temperature_, humidity_);
    sync_->registerCallback(
      std::bind(&PairPrinter::on_pair, this, std::placeholders::_1, std::placeholders::_2));
  }

private:
  void on_pair(const Temperature::ConstSharedPtr & t, const RelativeHumidity::ConstSharedPtr & h)
  {
    RCLCPP_INFO(
      get_logger(), "temperature at %.2f s with humidity at %.2f s",
      rclcpp::Time(t->header.stamp).seconds(), rclcpp::Time(h->header.stamp).seconds());
  }

  message_filters::Subscriber<Temperature> temperature_;
  message_filters::Subscriber<RelativeHumidity> humidity_;
  std::shared_ptr<message_filters::Synchronizer<Policy>> sync_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<PairPrinter>());
  rclcpp::shutdown();
  return 0;
}
