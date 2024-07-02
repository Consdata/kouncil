package com.consdata.kouncil.security.function;

import com.consdata.kouncil.model.admin.Function;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FunctionsRepository extends CrudRepository<Function, Long> {

}
