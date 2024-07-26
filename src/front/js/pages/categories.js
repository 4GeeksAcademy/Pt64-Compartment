import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Category = () => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    const fetchCategories = async () => {
        
        const response = await fetch(process.env.BACKEND_URL + "api/categories");
        if (response.ok) {
            const data = await response.json();
            console.log('Categories successfully gotten');
            setCategories(data);
        } else {
            console.error('Failed to fetch categories:', response.status);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName) return;

        const response = await fetch(process.env.BACKEND_URL + "api/create_category", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newCategoryName })
        });

        if (response.ok) {
            setNewCategoryName('');
            fetchCategories();
        } else {
            console.error('Failed to create category:', response.status);
        }
    };

    const handleDeleteCategory = async () => {
        const response = await fetch(process.env.BACKEND_URL + "api/delete_category", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newCategoryName })
        });
        if (response.ok) {
            setNewCategoryName('');
            fetchCategories();
        } else {
            console.error('Failed to create category:', response.status);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div>
            <div className="App">
                <div className="container mt-5">
                    <div className="card-deck">
                        {categories.map(category => (
                            <Link to={`/categories/${category.id}`} key={category.id}>
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <h1 className='d-flex justify-content-between'>
                                            {category.categoryName}
                                            <button type="button" className="close btn btn-danger" data-bs-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </h1>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <button type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModalCenter">
                        Create New Category
                    </button>

                    <div className="modal fade" id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLongTitle">Create New Category</h5>
                                    <button type="button" className="close btn btn-danger" data-bs-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Category Name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
                                    <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={handleCreateCategory}>Create Category</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
