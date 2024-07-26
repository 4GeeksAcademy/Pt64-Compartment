import React from "react";
import "../../styles/search-page.css";



import {AptMapComponent} from "../component/aptMap";


export const SearchPage = () => {
	

	return (
		<div className="searchPage-div">
		<div className="searchPageTitle">
			{/* <h1>Look for your perfect apartment here!</h1> */}
		</div>
		  
		  <AptMapComponent/>
		</div>
	  );
};
