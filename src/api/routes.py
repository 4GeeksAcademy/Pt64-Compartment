from flask import Flask, logging, request, current_app, jsonify, url_for, Blueprint
from api.models import db, User, Categories, Listings
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from datetime import datetime, timedelta
import hashlib
from werkzeug.security import generate_password_hash, check_password_hash
from openai import OpenAI
import json
import logging
import os
import re

client = OpenAI()

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, resources={r"/*": {"origins": "*"}})

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200

@api.route('/homes', methods=['GET'])
def get_homes():
    base_url = "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch"
    
    # Get parameters from the request, with defaults
    location = request.args.get('location', 'San Francisco, CA')
    home_type = request.args.get('home_type', 'Apartments')
    sort = request.args.get('sort', 'Newest')
    bedrooms = request.args.get('bedrooms')
    has_pool = request.args.get('hasPool')
    has_fireplace = request.args.get('hasFireplace')
    near_school = request.args.get('nearSchool')
    
    url = f"{base_url}?location={location}&home_type={home_type}&sort={sort}"
    if bedrooms:
        url += f'&bedrooms={bedrooms}'
    if has_pool:
        url += '&hasPool=true'
    if has_fireplace:
        url += '&hasFireplace=true'
    if near_school:
        url += '&nearbySchools=true'

api_key= 'AIzaSyA78pBoItwl17q9g5pZPNUYmLuOnTDPVo8'
def get_coordinates(address, api_key):
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": api_key
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'OK' and len(data['results']) > 0:
            location = data['results'][0]['geometry']['location']
            return location['lat'], location['lng']
        else:
            raise Exception("No results found or API error")
    else:
        raise Exception(f"Request failed with status code {response.status_code}")

@api.route('/geocode', methods=['GET'])
def geocode():
    address = request.args.get('address')
    if not address:
        return jsonify({"error": "Address parameter is required"}), 400

    try:
        latitude, longitude = get_coordinates(address, api_key)
        return jsonify({"latitude": latitude, "longitude": longitude})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/apartments', methods=['GET'])
def get_apartments():
    location = request.args.get('location', 'San Francisco, CA')
    beds = request.args.get('beds')
    baths = request.args.get('baths')

    url = "https://realtor-search.p.rapidapi.com/properties/search-rent"

    querystring = {
        "location": f"city:{location}",
        "sortBy": "newest",
        "propertyType": "apartment"
    }

    if beds:
        querystring["beds"] = beds
    if baths:
        querystring["baths"] = baths

    headers = {
        "x-rapidapi-key": "8c3485de4cmsh6d4dd16a945074ep14c798jsn2b52d362f60d",
        "x-rapidapi-host": "realtor-search.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    data = response.json()
    return jsonify(data), 200

def parse_numeric_preference(value):
    if not value:
        return None, None
    
    value = str(value).lower()
    numeric_match = re.search(r'\d+', value)
    if numeric_match:
        number = int(numeric_match.group())
        if any(word in value for word in ['less', 'under', 'below', 'max']):
            return number, 'less'
        elif any(word in value for word in ['more', 'over', 'above', 'min']):
            return number, 'more'
        else:
            return number, 'exact'
    return None, None



def process_zillow_data(data):
    processed_listings = []
    if isinstance(data, list):
        props = data
    else:
        props = data.get('props', [])
    
    print(f"Number of properties in raw data: {len(props)}")
    for listing in props:
        processed_listing = {
            'zpid': listing.get('zpid'),
            'address': listing.get('address'),
            'price': listing.get('price'),
            'bedrooms': listing.get('bedrooms'),
            'bathrooms': listing.get('bathrooms'),
            'living_area': listing.get('livingArea'),
            'home_type': listing.get('homeType'),
            'image_url': listing.get('imgSrc'),
            'has_fireplace': listing.get('hasFireplace', False),
            'has_pool': listing.get('hasPool', False),
            'nearby_schools': listing.get('nearbySchools', []),
            'year_built': listing.get('yearBuilt'),
            'lot_size': listing.get('lotSize'),
            'parking': listing.get('parkingType'),
            'heating': listing.get('heatingType'),
            'cooling': listing.get('coolingType'),
            'appliances': listing.get('appliances', []),
            'neighborhood': listing.get('neighborhood'),
            'walkScore': listing.get('walkScore'),
            'transitScore': listing.get('transitScore'),
            'bikeScore': listing.get('bikeScore'),
            'crime_rate': listing.get('crimeRate'),
            'latitude': listing.get('latitude'),
            'longitude': listing.get('longitude'),
            'nearby_amenities': listing.get('nearbyAmenities', []),
        }
        processed_listings.append(processed_listing)
    print(f"Number of processed listings: {len(processed_listings)}")
    return processed_listings


def extract_location_details(location_string):
    print(f"Extracting details from: {location_string}")
    location_string = location_string.lower().strip()
    details = {}
    
    # List of known cities (expand this list as needed)
    known_cities = ['palm springs', 'san diego', 'los angeles', 'new york', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san francisco', 'seattle']
    
    # Extract city (prioritize known cities)
    for city in known_cities:
        if city in location_string:
            details['city'] = city.title()
            break
    
    if 'city' not in details:
        # If no known city found, try to extract any capitalized words
        city_match = re.search(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b', location_string.title())
        if city_match:
            details['city'] = city_match.group(1)
    
    print(f"Extracted city: {details.get('city', 'None')}")
    
    # Extract number of bedrooms
    bedroom_patterns = [
        r'(\d+)\s*(?:br\b|bed(?:room)?s?\b)',
        r'(\d+)[-\s]bed(?:room)?s?\b'
    ]
    for pattern in bedroom_patterns:
        bedroom_match = re.search(pattern, location_string)
        if bedroom_match:
            details['bedrooms'] = int(bedroom_match.group(1))
            break
    
    # Extract number of bathrooms
    bathroom_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:ba\b|bath(?:room)?s?\b)',
        r'(\d+(?:\.\d+)?)[-\s]bath(?:room)?s?\b'
    ]
    for pattern in bathroom_patterns:
        bathroom_match = re.search(pattern, location_string)
        if bathroom_match:
            details['bathrooms'] = float(bathroom_match.group(1))
            break
    
    # Extract price
    price_patterns = [
        r'\$?(\d+(?:\.\d+)?)\s*(?:k|thousand)',
        r'\$?(\d+(?:\.\d+)?)\s*(?:m|million)',
        r'\$?(\d+(?:,\d{3})*(?:\.\d+)?)'
    ]
    for pattern in price_patterns:
        price_match = re.search(pattern, location_string)
        if price_match:
            price = float(price_match.group(1).replace(',', ''))
            if 'k' in price_match.group() or 'thousand' in price_match.group():
                price *= 1000
            elif 'm' in price_match.group() or 'million' in price_match.group():
                price *= 1000000
            details['price'] = price
            break
    
    print(f"Extracted details: {details}")
    return details

@api.route('/analyze_apartments', methods=['POST'])
def analyze_apartments():
    print("\n--- Starting analyze_apartments function ---")
    try:
        if not request.is_json:
            raise ValueError("Request data must be in JSON format")

        user_preferences = request.json.get('preferences', {})
        print("Received preferences:", json.dumps(user_preferences, indent=2))

        current_app.logger.info("analyze_apartments endpoint was called")
        
        # Fetch apartment data
        base_url = "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch"
        
        # Extract location details from location string
        full_location = user_preferences.get("location", "San Francisco, CA")
        location_details = extract_location_details(full_location)
        location = location_details.get('city')
        
        # If no city was extracted, use the full location string
        if not location:
            location = full_location
        
        print(f"Extracted location for search: {location}")
        
        sort = user_preferences.get("sort", "Newest")
        
        # Parse price input
        min_price = location_details.get('price') or user_preferences.get('min_price')
        max_price = user_preferences.get('max_price')
        
        # Parse square footage input
        sqft_value, sqft_comparison = parse_numeric_preference(user_preferences.get('square_footage'))
        
        bedrooms = location_details.get('bedrooms') or user_preferences.get('bedrooms')
        bathrooms = location_details.get('bathrooms') or user_preferences.get('bathrooms')
        
        print("\nParsed user preferences:")
        print(f"  Location: {location}")
        print(f"  Sort: {sort}")
        print(f"  Min price: {min_price}")
        print(f"  Max price: {max_price}")
        print(f"  Square footage: {sqft_value} {sqft_comparison}")
        print(f"  Bedrooms: {bedrooms}")
        print(f"  Bathrooms: {bathrooms}")
        
        # Construct URL with parameters
        url = f"{base_url}?location={location}&sort={sort}"
        if min_price:
            url += f'&price_min={min_price}'
        if max_price:
            url += f'&price_max={max_price}'
        if bedrooms:
            url += f'&beds_min={bedrooms}&beds_max={bedrooms}'
        if bathrooms:
            url += f'&baths_min={bathrooms}&baths_max={bathrooms}'

        print(f"\nConstructed URL: {url}")

        headers = {
    "X-RapidAPI-Key": "b795d0ddb7mshd6bc81c11ace173p1166a5jsn15beb32616c7",
    "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com"
}
        print("\nSending request to Zillow API")
        response = requests.get(url, headers=headers)
        print(f"Zillow API response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error response from Zillow API: {response.text}")
            raise Exception(f"Zillow API returned status code {response.status_code}")
        
        data = response.json()
        print("Received response from Zillow API")
        if isinstance(data, list):
            print(f"Number of properties in response: {len(data)}")
            processed_data = process_zillow_data(data)
        else:
            print(f"Number of properties in response: {len(data.get('props', []))}")
            processed_data = process_zillow_data(data)
        
        print(f"\nProcessed {len(processed_data)} apartments")
        
        if not processed_data:
            print("No properties found after processing")
            return jsonify({
                "apartments": [],
                "analysis": "No properties found matching your criteria. Please try adjusting your search parameters."
            }), 200

        # Filter processed data based on user preferences
        print(f"\nFiltering with user preferences")
        filtered_data = []
        for index, prop in enumerate(processed_data):
            price = prop.get('price')
            living_area = prop.get('living_area')
            bedrooms_count = prop.get('bedrooms')
            bathrooms_count = prop.get('bathrooms')

            print(f"\nEvaluating property {index + 1}:")
            print(f"  Price: {price}, Living Area: {living_area}, Bedrooms: {bedrooms_count}, Bathrooms: {bathrooms_count}")

            # Apply conditions
            conditions = []

            if min_price is not None and price is not None:
                condition = price >= int(min_price)
                conditions.append(condition)
                print(f"  Min price condition: {condition}")

            if max_price is not None and price is not None:
                condition = price <= int(max_price)
                conditions.append(condition)
                print(f"  Max price condition: {condition}")

            if sqft_value is not None and living_area is not None:
                if sqft_comparison == 'more':
                    condition = living_area >= sqft_value
                elif sqft_comparison == 'less':
                    condition = living_area <= sqft_value
                elif sqft_comparison == 'exact':
                    condition = living_area == sqft_value
                conditions.append(condition)
                print(f"  Square footage condition: {condition}")

            if bedrooms is not None and bedrooms_count is not None:
                condition = bedrooms_count == int(bedrooms)
                conditions.append(condition)
                print(f"  Bedrooms condition: {condition}")
            if bathrooms is not None and bathrooms_count is not None:
                condition = bathrooms_count == float(bathrooms)
                conditions.append(condition)
                print(f"  Bathrooms condition: {condition}")

            if not conditions or all(conditions):
                filtered_data.append(prop)
                print("  Property matched all conditions or no conditions were specified")
            else:
                print("  Property filtered out")

            print(f"  Applied conditions: {conditions}")

        print(f"\nFiltered {len(filtered_data)} properties matching user preferences")

        if not filtered_data:
            print("No properties found after filtering")
            return jsonify({
                "apartments": [],
                "analysis": "No properties found matching your criteria. Please try adjusting your search parameters."
            }), 200

        print(f"\nFiltered data sample: {json.dumps(filtered_data[:2], indent=2)}")
        
        # Analyze with OpenAI
        price_preference = f"Price range: {min_price if min_price else 'Not specified'} to {max_price if max_price else 'Not specified'}"
        sqft_preference = f"Square footage: {sqft_comparison} than {sqft_value}" if sqft_value else "Square footage: Not specified"
        openai_prompt = f"""
        Analyze the following user input to extract relevant home search criteria:
        "{user_preferences.get('location', '')}"

        Please extract and provide the following information:
        1. City name
        2. Number of bedrooms (if specified)
        3. Number of bathrooms (if specified)
        4. Price range (if specified)
        5. Any other relevant criteria mentioned (e.g., square footage, amenities)

        Then, analyze these properties based on the extracted preferences:
        Property data: {json.dumps(filtered_data)}

        Please provide a detailed analysis of the top 3-5 properties that best match the user's preferences, 
        including mentions of the special features listed above where applicable.

        Begin your response with a summary of the extracted search criteria, then proceed with the property analysis.
        """
        print("\nSending request to OpenAI")
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes property listings based on user preferences. Pay attention to all details provided, including features that are particularly attractive to homeowners."},
                {"role": "user", "content": openai_prompt}
            ],
            max_tokens=1500  # Adjust as needed
        )
        
        print("Received response from OpenAI")
        analysis = completion.choices[0].message.content
        
        # Combine results
        result = {
            "apartments": filtered_data,
            "analysis": analysis
        }
        
        print("\nSending response back to client")
        return jsonify(result), 200
    except Exception as e:
        print(f"\nError in analyze_apartments: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print(f"Error args: {e.args}")
        current_app.logger.error(f"Error in analyze_apartments: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
    finally:
        print("--- Ending analyze_apartments function ---\n")

def extract_city(text):
    # Simple regex to match city names (assuming they start with a capital letter)
    match = re.search(r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b', text)
    return match.group(1) if match else None


@api.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email already registered"}), 400

    new_user = User(email=email, is_active=True)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


@api.route('/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if user is None or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid email or password"}), 401

    # Create the access token
    access_token = create_access_token(identity=user.id)

    return jsonify({
        "message": "Logged in successfully",
        "access_token": access_token,
        "user_id": user.id
    }), 200

@api.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    id = get_jwt_identity()
    user = User.query.get(id).first()
    if user is None:
        raise APIException('user not found', status_code = 404)
    return jsonify(user.serialize()), 200

@api.route('/signup', methods=['POST'])
def create_user():
    email = request.json.get('email').strip()
    password = request.json.get('password').strip()
    
    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"msg": "User created successfully"}), 201


@api.route('/chatgpt/ask', methods = ["POST"])
def generate_city_list():
    request_body = request.json
    user_prompt = request_body["user_prompt"]
    if not user_prompt: return jsonify(message = "Please provide a prompt"), 400
    completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": """
        I'm going to ask you questions about different places to live. Do not use anything that is not JSON. You should return a list of 10 cities that matches the interests described for the user. The JSONs should have the following format: 

        {
        weather: "[replace with climate] - [replace with average temperature]",
        city: "string",
        state: "string",
        population: int,
        populationDensity: int,
        message: "Some good thing about this city and how it matches the user interests.",
        walkable: [boolean yes/no],
        }
        """},
        {"role": "user", "content": user_prompt}
        ]
    )
    return jsonify(result = json.loads(completion.choices[0].message.content))

















#----------------------------------------JP---------------------------------------

#route for getting Categories
@api.route('/categories', methods=['GET'])
# @jwt_required()
def get_categories():
    all_categories = list(map(lambda x: x.serialize(), Categories.query.all()))
    return jsonify(all_categories)

#route for createCategory
@api.route('/create_category', methods=['POST'])
# @jwt_required()
def create_category():
    data = request.get_json()
    uid = 1
    # get_jwt_identity()

    category_name = data.get('name')

    # Check if category_name is provided and not empty
    if category_name:
        # Add the category to the list (simulating storage)
        category = Categories(uid = uid, categoryName = category_name)
        db.session.add(category)
        db.session.commit()
        return jsonify({'message': 'Category created successfully'}), 200
    else:
        return jsonify({'error': 'Category name is required'}), 400
    
@api.route('/delete_category', methods=['DELETE'])
def delete_category():
    return

    
# creating new entry to database from chatgpt
@api.route('/addListingToCategory', methods=['POST'])
def add_listing():
    data = request.json  # Assuming data is sent as JSON
    
    # Example of adding a listing
    new_listing = Listings(cid=data['cid'], listingName=data['listingName'])
    db.session.add(new_listing)
    db.session.commit()
    
    return jsonify({'message': 'Listing added successfully'}), 201


@api.route("/get_listing_by_cat", methods=["GET"])
def get_listings_by_cat():
    all_listings = list(map(lambda x: x.serialize(), Listings.query.all()))

    return jsonify(all_listings)
    # query category table by name to get the id to then get the correct listings
    # filters the listings by catogory and return only those

#---------------------------------Secret Valerie Code-------------------------------

# @api.route('/user', methods=['GET'])
# @jwt_required()
# def get_user():
#     id = get_jwt_identity()
#     user = User.query.filter_by(id=id).first()

#     if user is not None:
#         return jsonify(user.serialize()), 200

#     return jsonify({"message": "Uh-oh"}), 400

# @api.route('/room', methods=['POST'])
# def add_room():
#     request_body = request.get_json(force=True)
#     name = request_body.get("name")
#     pic_url = request_body.get("pic_url")
#     objects = request_body.get("objects")
#     meta_tags = request_body.get("meta_tag")

#     return jsonify(request_body), 200

# @api.route('/rooms', methods=['GET'])
# def get_rooms():
#     rooms_list = Room.query
#     if "name" in request.args:
#         rooms_list = rooms_list.filter(Room.name.ilike(f"%{request.args['name']}%"))
#     rooms_list = rooms_list.all()
#     all_rooms = list(map(lambda room: room.serialize(), rooms_list))
#     return jsonify(all_rooms), 200

# @api.route('/objects/<int:id>', methods=['GET'])
# def get_object(id):
#     r_object = Object.query.filter_by(id=id).first()
#     return jsonify(r_object.serialize()), 200
