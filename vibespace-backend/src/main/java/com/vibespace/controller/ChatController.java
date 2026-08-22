package com.vibespace.controller;

import com.vibespace.model.MessageEntity;
import com.vibespace.repository.MessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ChatController {

    private final MessageRepository messageRepository;

    public ChatController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping("/{conversationId}/messages")
    public List<MessageEntity> getMessages(@PathVariable String conversationId) {
        return messageRepository.findByConversationId(conversationId);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<MessageEntity> sendMessage(@PathVariable String conversationId, @RequestBody MessageEntity message) {
        if (message.getId() == null || message.getId().isEmpty()) {
            message.setId("msg-" + System.currentTimeMillis());
        }
        message.setConversationId(conversationId);
        MessageEntity saved = messageRepository.save(message);
        return ResponseEntity.ok(saved);
    }
}
