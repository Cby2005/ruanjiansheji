package com.cby.smartfarm.rag.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class RagIndexRequest {
    private Boolean recreate = false;
    private List<RagChunkDTO> chunks = new ArrayList<>();
}
