'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { askOpenAI } from "@/lib/openai";
import { CareerMatch, FormData } from '@/types';

export default function Wizard() {
    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        age: '',
        currentCareer: '',
        yearsOfExperience: '',
        education: '',
        skills: [],
        interests: [],
        motivations: [],
        workStyle: '',
        salary: '',
    });
    const [results, setResults] = useState<CareerMatch[]>([]);
    const [customMotivation, setCustomMotivation] = useState<string>('');
    const [resultAI, setResultAI] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const totalSteps = 5;

    useEffect(() => {
        if (step === totalSteps) {
            calculateResults();
        }
    }, [step]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleArrayInputChange = (field: keyof Pick<FormData, 'skills' | 'interests' | 'motivations'>, value: string) => {
        if (formData[field].includes(value)) {
            setFormData((prev) => ({
                ...prev,
                [field]: prev[field].filter((item) => item !== value),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: [...prev[field], value],
            }));
        }
    };

    const addCustomMotivation = () => {
        if (customMotivation.trim() !== '' && !formData.motivations.includes(customMotivation)) {
            setFormData((prev) => ({
                ...prev,
                motivations: [...prev.motivations, customMotivation],
            }));
            setCustomMotivation('');
        }
    };

    const onNextStep = async () => {
        if (step === totalSteps - 1) {
            setLoading(true);
            const response = await askOpenAI(formData);
            if (response) {
                setResultAI(response);
                setLoading(false);
            }
        }
        setStep((prev) => prev + 1);
    }

    const nextDisabled = () => {
        if (step === 1) {
            return formData.name === '' || formData.age === '';
        } else if (step === 2) {
            return formData.currentCareer === '' || formData.yearsOfExperience === '' || formData.education === '';
        } else if (step === 3) {
            return formData.skills.length < 3 || formData.interests.length < 3;
        } else if (step === 4) {
            return formData.motivations.length < 1 || formData.workStyle === '' || formData.salary === '';
        }
        else if (step === totalSteps) {
            return loading;
        }
        return false;
    }

    const onRestart = () => {
        setStep(1);
        setFormData({
            name: '',
            age: '',
            currentCareer: '',
            yearsOfExperience: '',
            education: '',
            skills: [],
            interests: [],
            motivations: [],
            workStyle: '',
            salary: '',
        });
        setResults([]);
        setCustomMotivation('');
        setResultAI('');
    }

    const calculateResults = () => {
        const parsedResult = resultAI ? JSON.parse(resultAI) : {};
        setResults(parsedResult.resultInformations || []);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                        <div className="space-y-4">
                            <div>
                                <Input name='name' value={formData.name} onChange={handleInputChange} placeholder="Full Name" />
                            </div>
                            <div>
                                <Input type='number' name='age' value={formData.age} onChange={handleInputChange} placeholder="Age" />
                            </div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold mb-6">Current Career</h2>
                        <div className="space-y-4">
                            <div>
                                <Input name='currentCareer' value={formData.currentCareer} onChange={handleInputChange} placeholder="Current Job" />
                            </div>
                            <div>
                                <Input type="number" name='yearsOfExperience' value={formData.yearsOfExperience} onChange={handleInputChange} placeholder="Years of Experience" />
                            </div>
                            <div>
                                <Select
                                    onValueChange={(value) => {
                                        setFormData((prev) => ({ ...prev, education: value }));
                                    }}
                                    value={formData.education}

                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Educational Background" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="highschool">High School</SelectItem>
                                            <SelectItem value="associate degree">Associate Degree</SelectItem>
                                            <SelectItem value="licence">Licence</SelectItem>
                                            <SelectItem value="degree">Degree</SelectItem>
                                            <SelectItem value="doctorate">Doctorate</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold mb-6">Skills and Interests</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Skills (Choose at least 3)</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                    {['Analytical Thinking', 'Communication', 'Creativity', 'Problem Solving', 'Organization', 'Leadership', 'Technical Skills', 'Teamwork', 'Time Management'].map((skill) => (
                                        <div key={skill} className="flex items-center space-x-2">
                                            <Checkbox id={skill} checked={formData.skills.includes(skill)} onCheckedChange={() => handleArrayInputChange('skills', skill)} />
                                            <label htmlFor={skill} className="text-sm">{skill}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Your Interests (Choose at least 3)</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                    {['Technology', 'Art', 'Science', 'Health', 'Education', 'Business', 'Media', 'Sports', 'Travel', 'Design', 'Music', 'Food'].map((interest) => (
                                        <div key={interest} className="flex items-center space-x-2">
                                            <Checkbox id={interest} checked={formData.interests.includes(interest)} onCheckedChange={() => handleArrayInputChange('interests', interest)} />
                                            <label htmlFor={interest} className="text-sm">{interest}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold mb-6">Motivation and Expectation</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Factors that Motivate you</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {['High Salary', 'Work-Life Balance', 'Career Development', 'Flexible Working', 'Social Impact', 'Autonomy', 'Creativity', 'Recognition', 'Security'].map((motivation) => (
                                        <div key={motivation} className="flex items-center space-x-2">
                                            <Checkbox id={motivation} checked={formData.motivations.includes(motivation)} onCheckedChange={() => handleArrayInputChange('motivations', motivation)} />
                                            <label htmlFor={motivation} className="text-sm">{motivation}</label>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center space-x-2">
                                    <Input name='customMotivation' value={customMotivation} onChange={(e) => setCustomMotivation(e.target.value)} placeholder='Other' />

                                    <Button
                                        onClick={addCustomMotivation}
                                    >
                                        <PlusCircle size={20} />
                                    </Button>
                                </div>

                                {formData.motivations.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium mb-2">Selected motivation factors:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.motivations.map((motivation, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-black text-white rounded-full text-sm flex items-center">
                                                    {motivation}
                                                    <Button
                                                        onClick={() => handleArrayInputChange('motivations', motivation)}
                                                        className="ml-2"
                                                    >
                                                        &times;
                                                    </Button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Select
                                    onValueChange={(value) => {
                                        setFormData((prev) => ({ ...prev, workStyle: value }));
                                    }}
                                    value={formData.workStyle}

                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Your preferred working style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="remote">Remote</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                            <SelectItem value="office">Office</SelectItem>
                                            <SelectItem value="field">Field</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select
                                    onValueChange={(value) => {
                                        setFormData((prev) => ({ ...prev, salary: value }));
                                    }}
                                    value={formData.salary}

                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Your expected salary range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="0-10000">Up to 10,000 TL</SelectItem>
                                            <SelectItem value="10000-20000">10,000 TL - 20,000 TL</SelectItem>
                                            <SelectItem value="20000-30000">20,000 TL - 30,000 TL</SelectItem>
                                            <SelectItem value="30000-50000">30,000 TL - 50,000 TL</SelectItem>
                                            <SelectItem value="50000+">50,000 TL and above</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="space-y-8"
                    >
                        <h2 className="text-2xl font-bold mb-2">The Most Suitable Career Alternatives for You</h2>
                        <p className="text-gray-600">The most suitable career alternatives according to your data are shown below.</p>

                        <div className="mt-12 flex justify-center">
                            <div className="relative w-full max-w-2xl h-80 md:h-96">
                                <div className="absolute -bottom-4 top-[unset] sm:bottom-[unset] sm:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                                        className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                                    >
                                        <span className="text-xs md:text-sm text-center line-clamp-2 h-10">
                                            {formData.name || "Your Name"}
                                        </span>
                                    </motion.div>
                                </div>

                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 border border-dashed border-gray-300 rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-52 h-52 md:w-64 md:h-64 border border-dashed border-gray-300 rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-88 md:h-88 border border-dashed border-gray-300 rounded-full"></div>

                                {results.map((result, index) => {

                                    let distance = 0;
                                    if (result.match >= 95) {
                                        distance = 200;
                                    } else if (result.match >= 85) {
                                        distance = 110;
                                    } else {
                                        distance = 20;
                                    }
                                    const x = distance;

                                    return (
                                        <motion.div
                                            key={result.title}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                                            className="absolute z-20"
                                            style={{
                                                left: `${x}px`,
                                                top: `${x}px`,
                                            }}
                                        >
                                            <div
                                                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium shadow-md"
                                                style={{ backgroundColor: result.color }}
                                            >
                                                <div className="text-center">
                                                    <div>{result.match}%</div>
                                                </div>
                                            </div>
                                            <div className="mt-2 bg-white bg-opacity-90 p-1 rounded text-center shadow-md">
                                                <p className="font-semibold text-xs md:text-sm">{result.title}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            {results.map((result, index) => (
                                <motion.div
                                    key={result.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 + index * 0.2 }}
                                    className="p-4 border rounded-lg shadow-md"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium"
                                            style={{ backgroundColor: result.color }}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{result.title}</h3>
                                            <div className="flex items-center mt-1">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="h-2.5 rounded-full"
                                                        style={{ width: `${result.match}%`, backgroundColor: result.color }}
                                                    ></div>
                                                </div>
                                                <span className="ml-2 text-sm font-medium">{result.match}%</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">{result.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-lg font-medium">Congratulations! You have discovered your career alternatives.</p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            className="flex justify-center mt-6"
                        >
                            <Button
                                onClick={onRestart}
                            >
                                Restart
                            </Button>
                        </motion.div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    console.log('resultAI', resultAI);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Head>
                <title>Career Change Guide</title>
                <meta name="description" content="Kariyer değişikliği yapmak isteyenler için rehber uygulama" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-blue-800">Career Change Guide</h1>
                        <p className="mt-4 text-gray-600">Discover your new career path</p>
                    </div>

                    {step < totalSteps && (
                        <div className="mb-8">
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                                    <div
                                        style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                        <div className="p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                {renderStepContent()}
                            </AnimatePresence>
                        </div>

                        {step < totalSteps && (
                            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2 flex justify-between">
                                <Button
                                    onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                                    disabled={step === 1}
                                    className={`${step === 1
                                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                        : ''
                                        }`}
                                >
                                    <ArrowLeft size={16} className="mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={onNextStep}
                                    disabled={nextDisabled()}
                                    style={{ cursor: nextDisabled() ? 'not-allowed' : 'pointer' }}
                                >
                                    {step === totalSteps - 1 ? 'See The Results' : 'Next'}
                                    <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}