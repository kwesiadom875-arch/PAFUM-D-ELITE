const mongoose = require('mongoose');
const Product = require('../../models/Product');

describe('Product Model Validation', () => {
  const validProductData = {
    id: 1,
    name: 'Test Perfume',
    price: 100,
    category: 'Floral',
    description: 'A lovely floral scent.',
    image: 'http://example.com/image.jpg',
  };

  it('should create a product successfully with valid data', async () => {
    const product = new Product(validProductData);
    const savedProduct = await product.save();

    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe(validProductData.name);
    expect(savedProduct.brand).toBe("Parfum D'Elite"); // Default value
    expect(savedProduct.stockQuantity).toBe(10); // Default value
  });

  it('should fail validation without required fields', async () => {
    const product = new Product({});

    let err;
    try {
      await product.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.id).toBeDefined();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.price).toBeDefined();
    expect(err.errors.category).toBeDefined();
    expect(err.errors.description).toBeDefined();
    expect(err.errors.image).toBeDefined();
  });

  it('should enforce unique constraint on id', async () => {
    const product1 = new Product(validProductData);
    await product1.save();

    const product2 = new Product({
      ...validProductData,
      name: 'Another Perfume', // distinct name
    });

    let err;
    try {
      await product2.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    // Mongoose duplicate key error code is 11000
    expect(err.code).toBe(11000);
  });

  it('should validate enum values for accessTier', async () => {
    const product = new Product({
      ...validProductData,
      id: 2,
      accessTier: 'InvalidTier',
    });

    let err;
    try {
      await product.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.accessTier).toBeDefined();
  });

  it('should apply default values correctly', async () => {
    const product = new Product({
      ...validProductData,
      id: 3,
    });
    const savedProduct = await product.save();

    expect(savedProduct.brand).toBe("Parfum D'Elite");
    expect(savedProduct.concentration).toBe("Eau de Parfum");
    expect(savedProduct.origin).toBe("France");
    expect(savedProduct.rating).toBe(4.5);
    expect(savedProduct.isAvailable).toBe(true);
  });

  it('should validate nested sizes array', async () => {
    const product = new Product({
      ...validProductData,
      id: 4,
      sizes: [
        {
           // Missing size and price
           sku: 'TEST-SKU'
        }
      ]
    });

    let err;
    try {
      await product.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors['sizes.0.size']).toBeDefined();
    expect(err.errors['sizes.0.price']).toBeDefined();
  });
});
