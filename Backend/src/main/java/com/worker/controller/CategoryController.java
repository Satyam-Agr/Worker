package com.worker.controller;

import com.worker.model.Category;
import com.worker.repository.CategoryRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/category")
public class CategoryController {

	private final CategoryRepository categoryRepository;

	public CategoryController(CategoryRepository categoryRepository) {
		this.categoryRepository = categoryRepository;
	}

	@GetMapping("/all")
	public ResponseEntity<List<Category>> getAllCategories() {
		return ResponseEntity.ok(categoryRepository.findAll());
	}
}
