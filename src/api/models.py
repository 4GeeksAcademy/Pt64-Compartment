from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'
    
    def getCategories(self):
        categories = Categories.query.filter_by(uid=self.id)
        categories = [category.serialize() for category in categories]
        return categories
    
    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "categories": self.getCategories(),
            # do not serialize the password, its a security breach
        }
    
class Categories(db.Model):
    __tablename__ = "Categories"
    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.Integer, nullable=False)
    categoryName = db.Column(db.String(1000), unique=False, nullable=False)
    
    def __repr__(self):
        return f'<Category {self.categoryName}>'
    
    # def getListings(self):
    #     listings = Listings.query.filter_by(cid=self.categoryName)
    #     listings = [listing.serialize() for listing in listings]
    #     return listings

    def serialize(self):
        return {
            "id": self.id,
            "uid": self.uid,
            "categoryName": self.categoryName,
        }

class Listings(db.Model):
    __tablename__ = "Listings"
    id = db.Column(db.Integer, primary_key=True)
    cid = db.Column(db.Integer, nullable=False)
    listingName = db.Column(db.String(1000), unique=False, nullable=False)
    
    def __repr__(self):
        return f'<Listing {self.listingName}>'

    def serialize(self):
        return {
            "id": self.id,
            "uid": self.uid,
            "listingName": self.listingName,
 }