export interface FormData {
    name: string;
    age: string;
    currentCareer: string;
    yearsOfExperience: string;
    education: string;
    skills: string[];
    interests: string[];
    motivations: string[];
    workStyle: string;
    salary: string;
}

export interface CareerMatch {
    title: string;
    match: number;
    description: string;
    color: string;
}