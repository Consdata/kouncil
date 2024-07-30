package com.consdata.kouncil.security.group;

import com.consdata.kouncil.model.admin.UserGroup;
import java.util.List;
import java.util.Set;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserGroupRepository extends CrudRepository<UserGroup, Long> {

    List<UserGroup> findAllByCodeIn(Set<String> userGroupCodes);

    UserGroup findByCode(String code);

    UserGroup findByCodeAndIdIsNot(String code, Long id);
}
