package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.model.datamasking.Policy;
import org.springframework.data.repository.CrudRepository;

public interface PolicyRepository extends CrudRepository<Policy, Long> {

}
