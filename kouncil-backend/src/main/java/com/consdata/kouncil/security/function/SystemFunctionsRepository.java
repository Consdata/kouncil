package com.consdata.kouncil.security.function;

import com.consdata.kouncil.model.admin.SystemFunction;
import com.consdata.kouncil.model.admin.SystemFunctionName;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemFunctionsRepository extends CrudRepository<SystemFunction, Long> {

    SystemFunction findByName(SystemFunctionName systemFunctionName);
}
