package com.Away.blog.services;

import com.Away.blog.domain.entity.Category;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<Category> listCategories();
    Category createCategory(Category category);
    void deleteCategory(UUID id);
    Category findCategoryById(UUID id);
    Category updateCategory(UUID id, Category category);
}
