# Features

Here are some of the most important features of Kouncil. This list is not exhaustive. Check out
our [demo app](https://kouncil-demo.web.app/) or [quickly install Kouncil](README.md#quick-start) to
experience all features first-hand.

## Advanced record browsing in table format

Thanks to Kouncil's convenient way of presenting records in a table format, even large amounts of
complex messages can be easily browsed. You can choose between browsing a single partition or a
topic as a whole. If you wish to examine any of the messages more closely, you can view its source,
copy it to a clipboard, or even post it again.

<p align="left">
  <img src=".github/img/kouncil_topic_details_border.png" width="400">
  <span>
    &nbsp;&nbsp;&nbsp;&nbsp;
  </span>
  <img src=".github/img/kouncil_topic_event_details.png" width="400">
</p>

## Multiple cluster support

If your config spans across multiple Kafka clusters, it's not a problem for Kouncil. You can switch
between clusters at any time, without having to restart or reconfigure anything.

## Consumer monitoring

Monitoring your consumer groups is one of the most important things when dealing with Kafka. Are my
consumers even connected to Kafka? Do they process events? If so, how fast? How long until they
finish their work? Kouncil can help you answer all those questions.

<p align="left">
  <img src=".github/img/kouncil_consumer_group.png" width="820">
</p>

## Cluster monitoring

Monitoring your cluster's health can be as important as monitoring your consumer groups.
Kouncil shows the brokers that are currently connected to the cluster and their current resource
consumption (using
Kouncil's [advanced config](installation/DEPLOYMENT.md#docker---advanced-configuration))

<p align="left">
  <img src=".github/img/kouncil_brokers.png" width="820">
</p>

## Event tracking

Event tracking enables monitoring and visualizing the path of a given event or process across the
Kafka topics.

<p align="left">
  <img src=".github/img/kouncil_event_tracking.png" width="820">
</p>
