package com.consdata.kouncil.broker;

import com.consdata.kouncil.config.BrokerConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.management.MBeanServerConnection;
import javax.management.MBeanServerInvocationHandler;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import java.io.IOException;

import static java.lang.String.format;

@Slf4j
@Component
public class BrokerJXMClient {

    private static final String JMX_CONNECTION_TEMPLATE = "service:jmx:rmi:///jndi/rmi://%s:%s/jmxrmi";

    private static final String LANG_TYPE_OPERATING_SYSTEM_OBJECT_NAME = "java.lang:type=OperatingSystem";

    public SystemConfiguration getSystemMetrics(BrokerConfig brokerConfig) throws IOException, MalformedObjectNameException {
        JMXServiceURL url = new JMXServiceURL(format(JMX_CONNECTION_TEMPLATE, brokerConfig.getHost(), brokerConfig.getJmxPort()));
        JMXConnector jmxConnector = JMXConnectorFactory.connect(url);
        MBeanServerConnection mbeanServerConnection = jmxConnector.getMBeanServerConnection();

        ObjectName mbeanName = new ObjectName(LANG_TYPE_OPERATING_SYSTEM_OBJECT_NAME);

        return MBeanServerInvocationHandler.newProxyInstance(
                mbeanServerConnection,
                mbeanName,
                SystemConfiguration.class,
                true);
    }
}
