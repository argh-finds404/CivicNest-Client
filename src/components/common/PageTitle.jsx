import React from'react';
import { Helmet } from'react-helmet-async';

const PageTitle = ({ title }) => {
 const defaultTitle ="CivicNest - Community Cleanliness & Care";
 const displayTitle = title ?`${title} | CivicNest`: defaultTitle;

 return (
 <Helmet>
 <title>{displayTitle}</title>
 </Helmet>
 );
};

export default PageTitle;
