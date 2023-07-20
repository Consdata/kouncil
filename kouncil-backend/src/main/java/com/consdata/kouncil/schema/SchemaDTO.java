package com.consdata.kouncil.schema;

import com.consdata.kouncil.serde.Compatibility;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.SubjectType;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemaDTO {

    private MessageFormat messageFormat;
    private String plainTextSchema;
    private String topicName;
    private String subjectName;
    private int version;
    private SubjectType subjectType;
    private List<Integer> versionsNo;
    private Compatibility compatibility;
}
