package com.consdata.kouncil.broker;

public interface SystemConfiguration {

    String getName();

    String getArch();

    String getVersion();

    int getAvailableProcessors();

    double getSystemLoadAverage();

    long getCommittedVirtualMemorySize();

    long getTotalSwapSpaceSize();

    long getFreeSwapSpaceSize();

    long getProcessCpuTime();

    long getFreePhysicalMemorySize();

    long getTotalPhysicalMemorySize();

    double getSystemCpuLoad();

    double getProcessCpuLoad();
}
