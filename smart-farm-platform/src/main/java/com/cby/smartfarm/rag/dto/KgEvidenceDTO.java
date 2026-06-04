package com.cby.smartfarm.rag.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KgEvidenceDTO {
    private String source;
    private String relation;
    private String target;
    private String evidence;
}
