package com.example.Student.controller;

import com.example.Student.model.Notice;
import com.example.Student.repository.NoticeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {
    private final NoticeRepository noticeRepository;

    public NoticeController(NoticeRepository noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    @GetMapping
    public List<Notice> getNotices() {
        return noticeRepository.findAllByOrderByDateDesc();
    }

    @PostMapping
    public Notice createNotice(@RequestBody Notice notice) {
        if (notice.getDate() == null) {
            notice.setDate(LocalDate.now());
        }
        return noticeRepository.save(notice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Integer id) {
        if (!noticeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        noticeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
