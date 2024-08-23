## Managing Kafka clusters

Starting from version 1.9 you will be able to configure and secure your Kafka clusters from UI. To
do it log in to the app and select Clusters menu item. You will see your clusters list. To add new
cluster click `Add new cluster` button and cluster form will be opened.

<p align="left">
    <img src="../.github/img/kouncil_cluster_form.png" width="820">
</p>

### Cluster SSL/TLS configuration

If your Kafka cluster requires any authentication you are able to configure `SASL`, `SSL`
or `AWS MSK` authentication.

<p align="left">
    <img src="../.github/img/kouncil_cluster_form_cluster_security.png" width="820">
</p>

### Schema registry

Within this form you are able to add Schema Registry to your cluster.

<p align="left">
    <img src="../.github/img/kouncil_cluster_form_schema_registry.png" width="820">
</p>

If your Schema Registry requires any authentication you are able to configure `SSL`
or `SSL with basic authentication` security.
