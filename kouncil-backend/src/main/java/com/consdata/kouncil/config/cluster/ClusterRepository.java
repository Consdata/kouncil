package com.consdata.kouncil.config.cluster;

import com.consdata.kouncil.model.cluster.Cluster;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClusterRepository extends CrudRepository<Cluster, Long> {

}
