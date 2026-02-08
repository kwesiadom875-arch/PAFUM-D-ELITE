const productController = require('../controllers/productController');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

// Mock Mongoose Models
jest.mock('../models/User');
jest.mock('../models/Product', () => {
  const mockSave = jest.fn();
  const mockProductInstance = {
    save: mockSave,
    toObject: jest.fn().mockReturnThis()
  };
  // The mock constructor returns the same instance every time
  const mockProductModel = jest.fn(() => mockProductInstance);

  // Attach static methods
  mockProductModel.find = jest.fn();
  mockProductModel.findOne = jest.fn();
  mockProductModel.findById = jest.fn();
  mockProductModel.findOneAndUpdate = jest.fn();
  mockProductModel.findByIdAndUpdate = jest.fn();
  mockProductModel.findOneAndDelete = jest.fn();
  mockProductModel.findByIdAndDelete = jest.fn();

  return mockProductModel;
});

describe('Product Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {},
      body: {},
      query: {},
      userId: null
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    // Reset the save mock implementation to resolve by default
    const mockInstance = new Product();
    mockInstance.save.mockResolvedValue(mockInstance);
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [{ id: 1, name: 'P1' }, { id: 2, name: 'P2' }];
      Product.find.mockResolvedValue(mockProducts);

      await productController.getAllProducts(req, res);

      expect(Product.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      Product.find.mockRejectedValue(new Error(errorMessage));

      await productController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getProductById', () => {
    it('should return product by numeric id', async () => {
      req.params.id = '123';
      const mockProduct = { id: 123, name: 'Product 123' };
      Product.findOne.mockResolvedValue(mockProduct);

      await productController.getProductById(req, res);

      expect(Product.findOne).toHaveBeenCalledWith({ id: '123' });
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should return product by ObjectId if numeric search fails', async () => {
      const objectId = new mongoose.Types.ObjectId().toString();
      req.params.id = objectId;
      const mockProduct = { _id: objectId, name: 'Product ObjectId' };

      Product.findOne.mockResolvedValue(null);
      Product.findById.mockResolvedValue(mockProduct);

      await productController.getProductById(req, res);

      // findOne is skipped because !isNaN(objectId) is false
      expect(Product.findById).toHaveBeenCalledWith(objectId);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should return 404 if product not found', async () => {
      req.params.id = '999';
      Product.findOne.mockResolvedValue(null);

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    it('should handle errors', async () => {
      req.params.id = '123';
      const errorMessage = 'DB Error';
      Product.findOne.mockRejectedValue(new Error(errorMessage));

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('createProduct', () => {
    it('should create and return a new product', async () => {
      req.body = { name: 'New Product', price: 100 };
      const mockInstance = new Product(); // Get access to the mock instance

      await productController.createProduct(req, res);

      expect(Product).toHaveBeenCalledWith(req.body);
      expect(mockInstance.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockInstance);
    });

    it('should handle errors during creation', async () => {
      req.body = { name: 'New Product' };
      const errorMessage = 'Validation Error';
      const mockInstance = new Product();
      mockInstance.save.mockRejectedValue(new Error(errorMessage));

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product by numeric id', async () => {
      req.params.id = '123';
      const mockResult = { id: 123, deletedCount: 1 };
      Product.findOneAndDelete.mockResolvedValue(mockResult);

      await productController.deleteProduct(req, res);

      expect(Product.findOneAndDelete).toHaveBeenCalledWith({ id: '123' });
      expect(res.json).toHaveBeenCalledWith({ message: "Deleted" });
    });

    it('should delete product by ObjectId if numeric delete fails', async () => {
      const objectId = new mongoose.Types.ObjectId().toString();
      req.params.id = objectId;

      Product.findOneAndDelete.mockResolvedValue(null);
      Product.findByIdAndDelete.mockResolvedValue({ _id: objectId });

      await productController.deleteProduct(req, res);

      expect(Product.findOneAndDelete).toHaveBeenCalledWith({ id: objectId });
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(objectId);
      expect(res.json).toHaveBeenCalledWith({ message: "Deleted" });
    });

    it('should handle errors', async () => {
      req.params.id = '123';
      const errorMessage = 'Delete Error';
      Product.findOneAndDelete.mockRejectedValue(new Error(errorMessage));

      await productController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('updateProduct', () => {
    it('should update and return product by numeric id', async () => {
      req.params.id = '123';
      req.body = { name: 'Updated' };
      const mockUpdatedProduct = { id: 123, name: 'Updated' };

      Product.findOneAndUpdate.mockResolvedValue(mockUpdatedProduct);

      await productController.updateProduct(req, res);

      expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
        { id: '123' },
        req.body,
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockUpdatedProduct);
    });

    it('should update and return product by ObjectId if numeric update fails', async () => {
      const objectId = new mongoose.Types.ObjectId().toString();
      req.params.id = objectId;
      req.body = { name: 'Updated' };
      const mockUpdatedProduct = { _id: objectId, name: 'Updated' };

      Product.findOneAndUpdate.mockResolvedValue(null);
      Product.findByIdAndUpdate.mockResolvedValue(mockUpdatedProduct);

      await productController.updateProduct(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        objectId,
        req.body,
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockUpdatedProduct);
    });

    it('should return 404 if product to update not found', async () => {
      req.params.id = '123';
      Product.findOneAndUpdate.mockResolvedValue(null);

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    it('should handle errors', async () => {
      req.params.id = '123';
      Product.findOneAndUpdate.mockRejectedValue(new Error('Update Error'));

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update Error' });
    });
  });

  describe('getRecommendationsByUser', () => {
    it('should return 404 if user not found', async () => {
      req.params.userId = 'user123';
      User.findById.mockResolvedValue(null);

      await productController.getRecommendationsByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it('should return top products if order history is empty', async () => {
      req.params.userId = 'user123';
      const mockUser = { orderHistory: [] };
      User.findById.mockResolvedValue(mockUser);

      const mockTopProducts = [{ name: 'Top1' }, { name: 'Top2' }];
      // We need to mock the chain: find().sort().limit()
      const mockLimit = jest.fn().mockResolvedValue(mockTopProducts);
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      Product.find.mockReturnValue({ sort: mockSort });

      await productController.getRecommendationsByUser(req, res);

      expect(Product.find).toHaveBeenCalled();
      expect(mockSort).toHaveBeenCalledWith({ rating: -1 });
      expect(mockLimit).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(mockTopProducts);
    });

    it('should return recommendations based on recent categories', async () => {
      req.params.userId = 'user123';
      const mockUser = {
        orderHistory: [
          { productCategory: 'Floral', productId: 10 },
          { productCategory: 'Woody', productId: 11 }
        ]
      };
      User.findById.mockResolvedValue(mockUser);

      const mockRecs = [{ name: 'Rec1' }];
      const mockLimit = jest.fn().mockResolvedValue(mockRecs);
      Product.find.mockReturnValue({ limit: mockLimit });

      await productController.getRecommendationsByUser(req, res);

      expect(Product.find).toHaveBeenCalledWith({
        category: { $in: ['Floral', 'Woody'] },
        id: { $nin: [10, 11] } // Exclude already purchased products
      });
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith(mockRecs);
    });
  });

  describe('getRecommendationsByProduct', () => {
    it('should return 404 if product not found', async () => {
      req.params.productId = '999';
      Product.findOne.mockResolvedValue(null);
      await productController.getRecommendationsByProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return similar products', async () => {
      req.params.productId = '100';
      const mockProduct = { id: 100, category: 'Floral' };
      Product.findOne.mockResolvedValue(mockProduct);

      const mockRecs = [{ id: 101 }];
      const mockLimit = jest.fn().mockResolvedValue(mockRecs);
      Product.find.mockReturnValue({ limit: mockLimit });

      await productController.getRecommendationsByProduct(req, res);

      expect(Product.find).toHaveBeenCalledWith({
          category: 'Floral',
          id: { $ne: 100 }
      });
      expect(res.json).toHaveBeenCalledWith(mockRecs);
    });
  });

  describe('getVaultProducts', () => {
    it('should return unlocked products based on user tier', async () => {
      req.userId = 'user123';
      const mockUser = { tier: 'Gold' };
      User.findById.mockResolvedValue(mockUser);

      const mockExclusiveProducts = [
        { name: 'P1', accessTier: 'Bronze', toObject: () => ({ name: 'P1', accessTier: 'Bronze' }) },
        { name: 'P2', accessTier: 'Diamond', toObject: () => ({ name: 'P2', accessTier: 'Diamond' }) }
      ];
      Product.find.mockResolvedValue(mockExclusiveProducts);

      await productController.getVaultProducts(req, res);

      // Gold (1) >= Bronze (0) -> Unlocked
      // Gold (1) < Diamond (2) -> Locked
      expect(res.json).toHaveBeenCalledWith([
        { name: 'P1', accessTier: 'Bronze', isUnlocked: true },
        { name: 'P2', accessTier: 'Diamond', isUnlocked: false }
      ]);
    });
  });

  describe('getOlfactoryMap', () => {
    it('should aggregate notes from products', async () => {
      const mockProducts = [
        { id: 1, notes: 'Rose, Oud' },
        { id: 2, notes: 'Rose, Amber' }
      ];
      Product.find.mockResolvedValue(mockProducts);

      await productController.getOlfactoryMap(req, res);

      // Rose: 2, Oud: 1, Amber: 1
      // Sorted by count desc -> Rose first
      const responseData = res.json.mock.calls[0][0];
      expect(responseData[0].name).toBe('Rose');
      expect(responseData[0].count).toBe(2);
      expect(responseData.length).toBe(3);
    });
  });
});
