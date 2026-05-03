export function getSchoolInfo(school: string) : SchoolInfo {
    return {
        iconUrl: "https://catalog.ucdavis.edu/images/uc-logo-gold.svg",
        name: "UC Davis",
        fullName: "University of California, Davis",
        location: "Davis, California",
        primaryColor: "#FFBF00", // Color of main elements (eg. text and logos)
        secondaryColor: "#022851", // Color of secondary elements (eg. headers, backgrounds)
        id: "ucdavis"
    }
}

export type SchoolInfo = {
    iconUrl: string;
    name: string;
    fullName: string;
    location: string;
    primaryColor?: string;
    secondaryColor?: string;
    id: string;
}