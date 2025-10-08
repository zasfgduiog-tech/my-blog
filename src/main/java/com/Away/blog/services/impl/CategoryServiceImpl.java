package com.Away.blog.services.impl;


import com.Away.blog.domain.entity.Category;
import com.Away.blog.repositories.CategoryRepository;
import com.Away.blog.services.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override
    public List<Category> listCategories() {
        return categoryRepository.findAllWithPostCount();
    }

    @Override
    @Transactional
    public Category createCategory(Category category) {
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new IllegalArgumentException("Category name already exists"+category.getName());
        }
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(UUID id){
        Optional<Category> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            if(!category.get().getPosts().isEmpty()){
                throw new IllegalStateException("Category post already exists"+category.get().getPosts().size());
            }
            categoryRepository.delete(category.get());
        }
    }

    @Override
    public Category findCategoryById(UUID id) {
        return categoryRepository.findById(id).orElseThrow(()->new EntityNotFoundException("Category id not exists"+id));
    }
}
