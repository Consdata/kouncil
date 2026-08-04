# **Kouncil – Migration Guide**

## **TL;DR**

The Kouncil project is entering a 6-month deprecation period. Active development has ended, and the demo environment will be shut down on **February 4, 2027.**. The repository will switch to Read-Only mode. Since Kouncil is a stateless application, migration simply means redirecting your configuration to a new GUI tool.

Below you’ll find instructions on what to copy, as well as two alternative tools we recommend.

## **Configuration Migration – No Data Loss**

Kouncil does not store cluster state, messages, or schemas. All production data remains safe on your Kafka brokers. Before shutting down your Kouncil instance, extract the following values from your configuration file (or environment variables) and provide them in the new tool of your choosing:

* bootstrap.servers – addresses of your brokers,  
*  **Security config** – authentication details, including SASL JAAS config, truststore/keystore paths, and passwords if you use SSL/mTLS,  
* schema.registry.url – Schema Registry endpoint (Avro/Protobuf/JSON), if applicable, along with SSL/mTLS configuration for connecting to the Schema Registry,  
* Authorization & authentication config (LDAP, OAuth).

## **Recommended Alternatives**

We’ve selected two sensible migration options, depending on your project requirements.

| Feature | Kafbat (Open-Source Option) | Conduktor (Enterprise Option) |
| :---- | :---- | :---- |
| **License** | Apache 2.0 (100% free) | Freemium (free for up to 50 users and 3 clusters) |
| **Cluster management** | Multiple clusters | Multiple clusters |
| **Authorization (RBAC, SSO)** | Basic | Full (requires commercial license) |
| **Target audience** | Teams looking for a free drop-in replacement (fork of Provectus UI) | Large organizations needing audits, data masking, and vendor support |

### 

### **1\. Kafbat**

A direct fork of the abandoned Provectus UI for Apache Kafka. Actively developed by the community, lightweight, and completely free.

* **Why Kafbat?** If you need a 100% OSS tool with a solid UI that you can quickly deploy via Docker as a direct replacement for Kouncil, this is your best option.  
* [**Documentation: Quick Start (Kafbat)**](https://ui.docs.kafbat.io/)

### **2\. Conduktor**

A commercial platform that, beyond a basic UI, provides a powerful set of governance and security tools for Kafka. The free tier is sufficient for small and medium environments.

* **Why Conduktor?** Perfect for organizations requiring strict access control (RBAC), sensitive data masking in views, and planning future investment in enterprise licensing.  
* [**Documentation: Installation (Conduktor)**](https://docs.conduktor.io/)

## **FAQ**

**When exactly will the Kouncil demo environment stop working?**

It will be permanently shut down on February 4, 2027.

**What will happen to the Kouncil GitHub repository?**

It will be archived. The source code will remain publicly available (Read-Only) as a showcase of our team’s work, but we will not continue to publish any security fixes or new releases.

**Why are you sunsetting the project?** 

We’re focusing 100% of our resources on our core products (including Eximee). Kouncil was a development project that allowed us to dive deeper into the real-time data ecosystem, test unique architectural solutions in practice, and gather valuable know-how from engineers around the world.

Thank you for developing this tool together with us\!
