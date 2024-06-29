package com.consdata.kouncil.security.group;

import com.consdata.kouncil.model.admin.UserGroup;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends CrudRepository<UserGroup, Long> {

}
