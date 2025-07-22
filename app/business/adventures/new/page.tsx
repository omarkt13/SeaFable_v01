
"use client"

import React, { useState, useEffect } from 'react';
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Users, 
  Euro, 
  Plus, 
  Trash2, 
  Camera, 
  AlertTriangle,
  Check,
  Star,
  Activity,
  Calendar,
  Settings,
  Eye,
  Waves,
  Mountain,
  Utensils,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Hash,
  HelpCircle,
  Shield,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import Link from "next/link"
import { Button } from "@/components/ui/button"

const ExperienceCreationForm = () => {
  const router = useRouter()
  const { user, businessProfile } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    location: '',
    specificLocation: '',
    activityType: '',
    difficultyLevel: '',
    categories: [],
    pricePerPerson: '',
    minGuests: 1,
    maxGuests: '',
    durationHours: '',
    durationDisplay: '',
    itinerary: [],
    availabilityDates: [],
    primaryImageUrl: '',
    additionalImages: [],
    weatherContingency: '',
    includedAmenities: [],
    notIncludedItems: [],
    whatToBring: [],
    minAge: '',
    maxAge: '',
    ageRestrictionDetails: '',
    tags: [],
    cancellationPolicy: 'moderate',
    cancellationDetails: '',
    faqItems: [],
    isActive: true
  });

  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityTypes = [
    { id: 'water_sport', label: 'Water Sport', icon: <Waves className="h-5 w-5" /> },
    { id: 'land_adventure', label: 'Land Adventure', icon: <Mountain className="h-5 w-5" /> },
    { id: 'cultural', label: 'Cultural', icon: <Camera className="h-5 w-5" /> },
    { id: 'food_tour', label: 'Food Tour', icon: <Utensils className="h-5 w-5" /> },
    { id: 'wildlife', label: 'Wildlife', icon: <Eye className="h-5 w-5" /> }
  ];

  const categoryOptions = {
    water_sport: ['Kayaking', 'Snorkeling', 'Diving', 'Sailing', 'Surfing', 'Fishing', 'Stand-up Paddleboard'],
    land_adventure: ['Hiking', 'Rock Climbing', 'Cycling', 'ATV Tours', 'Zip-lining'],
    cultural: ['City Tour', 'Museum Visit', 'Historical Sites', 'Art Workshop'],
    food_tour: ['Cooking Class', 'Wine Tasting', 'Local Markets', 'Street Food'],
    wildlife: ['Bird Watching', 'Marine Life', 'Safari', 'Nature Photography']
  };

  const commonTags = ['Family Friendly', 'Beginner Friendly', 'Advanced', 'Small Group', 'Private', 'Guided', 'Self-Guided', 'Photography', 'Romantic', 'Adventure', 'Relaxing', 'Educational'];
  const amenityOptions = ['Equipment', 'Snacks', 'Drinks', 'Guide', 'Transportation', 'Photos', 'Insurance', 'Accommodation', 'Meals', 'Professional Instruction'];
  const notIncludedOptions = ['Transportation', 'Personal Insurance', 'Gratuities', 'Alcoholic Beverages', 'Personal Items', 'Travel Insurance', 'Hotel Pickup'];
  const bringOptions = ['Swimsuit', 'Towel', 'Sunscreen', 'Water Bottle', 'Camera', 'Comfortable Shoes', 'Hat', 'Sunglasses', 'Light Jacket', 'ID/Passport'];

  const cancellationPolicies = [
    { id: 'flexible', label: 'Flexible', description: 'Full refund 24 hours before arrival' },
    { id: 'moderate', label: 'Moderate', description: 'Full refund 5 days before arrival' },
    { id: 'strict', label: 'Strict', description: 'Full refund 14 days before arrival' }
  ];

  const steps = [
    { id: 1, title: 'Experience Basics', icon: <Activity className="h-5 w-5" /> },
    { id: 2, title: 'Details & Media', icon: <Camera className="h-5 w-5" /> },
    { id: 3, title: 'Pricing & Availability', icon: <Calendar className="h-5 w-5" /> },
    { id: 4, title: 'Itinerary', icon: <Clock className="h-5 w-5" /> },
    { id: 5, title: 'Inclusions & Requirements', icon: <Shield className="h-5 w-5" /> },
    { id: 6, title: 'Policies & FAQ', icon: <HelpCircle className="h-5 w-5" /> },
    { id: 7, title: 'Preview & Publish', icon: <Eye className="h-5 w-5" /> }
  ];

  // Validation functions
  const validateStep = (step) => {
    switch(step) {
      case 1:
        return formData.title.length >= 5 && formData.location && formData.activityType;
      case 2:
        return formData.shortDescription.length >= 20 && formData.categories.length > 0 && formData.difficultyLevel;
      case 3:
        return formData.pricePerPerson && formData.maxGuests && formData.durationHours && formData.availabilityDates.length > 0;
      case 4:
        return formData.itinerary.length >= 2;
      case 5:
        return formData.includedAmenities.length > 0 && formData.whatToBring.length > 0;
      case 6:
        return formData.cancellationPolicy && formData.faqItems.length >= 2;
      default:
        return true;
    }
  };

  // Update completed steps
  useEffect(() => {
    const newCompletedSteps = new Set();
    for (let i = 1; i <= 7; i++) {
      if (validateStep(i)) {
        newCompletedSteps.add(i);
      }
    }
    setCompletedSteps(newCompletedSteps);
  }, [formData]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // AI-powered form generation
  const generateFullForm = async () => {
    if (!formData.shortDescription || formData.shortDescription.length < 20) {
      toast({
        title: "Error",
        description: "Please provide a short description first to generate the form details.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation with realistic data based on description
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiGenerated = {
      fullDescription: `Experience the magic of ${formData.location || 'this beautiful destination'} through our carefully crafted adventure. ${formData.shortDescription} Our expert guides will ensure you have an unforgettable experience while maintaining the highest safety standards. Perfect for travelers seeking authentic local experiences with professional guidance and premium service.`,
      tags: ['Guided', 'Small Group', 'Photography', 'Adventure'].slice(0, Math.floor(Math.random() * 4) + 2),
      faqItems: [
        {
          id: Date.now() + 1,
          question: `What is ${formData.title || 'this experience'}?`,
          answer: formData.shortDescription
        },
        {
          id: Date.now() + 2,
          question: 'What\'s included in the experience?',
          answer: 'Professional guide, all necessary equipment, and refreshments are included. Detailed inclusions are listed in the experience details.'
        },
        {
          id: Date.now() + 3,
          question: 'What should I bring?',
          answer: 'We recommend bringing comfortable clothing, sunscreen, water bottle, and a camera to capture the memories.'
        }
      ],
      cancellationDetails: 'Free cancellation up to 5 days before the experience. Partial refunds available for cancellations within 5 days.'
    };

    setFormData(prev => ({
      ...prev,
      ...aiGenerated
    }));
    
    setIsGenerating(false);
    
    toast({
      title: "Success!",
      description: "AI has generated additional details for your experience.",
    });
  };

  // Image upload simulation
  const handleImageUpload = (type, file = null) => {
    // Simulate image upload
    const mockImageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=400&h=300&fit=crop`;
    
    if (type === 'primary') {
      updateFormData('primaryImageUrl', mockImageUrl);
    } else {
      updateFormData('additionalImages', [...formData.additionalImages, mockImageUrl]);
    }
  };

  // Date management
  const addAvailabilityDate = () => {
    const today = new Date().toISOString().split('T')[0];
    updateFormData('availabilityDates', [...formData.availabilityDates, today]);
  };

  const removeAvailabilityDate = (index) => {
    updateFormData('availabilityDates', formData.availabilityDates.filter((_, i) => i !== index));
  };

  // Tag management
  const addTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      updateFormData('tags', [...formData.tags, tag]);
    }
  };

  const removeTag = (tag) => {
    updateFormData('tags', formData.tags.filter(t => t !== tag));
  };

  // FAQ management
  const addFaqItem = () => {
    const newFaq = {
      id: Date.now(),
      question: '',
      answer: ''
    };
    updateFormData('faqItems', [...formData.faqItems, newFaq]);
  };

  const updateFaqItem = (id, field, value) => {
    const updated = formData.faqItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    updateFormData('faqItems', updated);
  };

  const removeFaqItem = (id) => {
    updateFormData('faqItems', formData.faqItems.filter(item => item.id !== id));
  };

  // Itinerary management
  const addItineraryItem = () => {
    const newItem = {
      id: Date.now(),
      time: '',
      title: '',
      description: '',
      duration: 30
    };
    updateFormData('itinerary', [...formData.itinerary, newItem]);
  };

  const updateItineraryItem = (id, field, value) => {
    const updated = formData.itinerary.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    updateFormData('itinerary', updated);
  };

  const removeItineraryItem = (id) => {
    updateFormData('itinerary', formData.itinerary.filter(item => item.id !== id));
  };

  const generateDescription = () => {
    if (!formData.title || !formData.activityType || formData.categories.length === 0) return;
    
    const activity = activityTypes.find(a => a.id === formData.activityType)?.label;
    const mainCategory = formData.categories[0];
    const duration = formData.durationHours ? `${formData.durationHours}-hour` : '';
    const location = formData.location;
    
    const generated = `Join us for an unforgettable ${duration} ${mainCategory.toLowerCase()} experience in ${location}. Perfect for ${formData.difficultyLevel === 'easy' ? 'beginners and families' : formData.difficultyLevel === 'expert' ? 'experienced adventurers' : 'all skill levels'}, this ${activity.toLowerCase()} adventure offers${formData.maxGuests <= 6 ? ' an intimate' : ' a group'} setting for up to ${formData.maxGuests} guests.`;
    
    updateFormData('shortDescription', generated);
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Experience Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="e.g., Sunset Sailing Adventure in San Francisco Bay"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength="100"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="City, State/Region"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Activity Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activityTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => updateFormData('activityType', type.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.activityType === type.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {type.icon}
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* AI Generation Section */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI-Powered Form Generation</h3>
                </div>
                <button
                  onClick={generateFullForm}
                  disabled={isGenerating || formData.shortDescription.length < 20}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isGenerating || formData.shortDescription.length < 20
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    '✨ Generate with AI'
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Add a short description below, then use AI to automatically generate tags, FAQ, detailed descriptions, and more!
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categories *
              </label>
              {formData.activityType && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categoryOptions[formData.activityType]?.map((category) => (
                    <label key={category} className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.categories, category]
                            : formData.categories.filter(c => c !== category);
                          updateFormData('categories', updated);
                        }}
                        className="rounded text-teal-600"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['easy', 'moderate', 'challenging', 'expert'].map((level) => (
                  <div
                    key={level}
                    onClick={() => updateFormData('difficultyLevel', level)}
                    className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                      formData.difficultyLevel === level
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium capitalize">{level}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Short Description *
                </label>
                <button
                  onClick={generateDescription}
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                  ✨ Generate for me
                </button>
              </div>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => updateFormData('shortDescription', e.target.value)}
                placeholder="A compelling 1-2 sentence description that highlights what makes your experience special..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows="3"
                maxLength="250"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/250 characters</p>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Experience Images
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Primary Image *</p>
                  <div 
                    onClick={() => handleImageUpload('primary')}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50"
                  >
                    {formData.primaryImageUrl ? (
                      <img src={formData.primaryImageUrl} alt="Primary" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload primary image</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Additional Images</p>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.additionalImages.slice(0, 3).map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img} alt={`Additional ${index + 1}`} className="w-full h-20 object-cover rounded" />
                        <button
                          onClick={() => updateFormData('additionalImages', formData.additionalImages.filter((_, i) => i !== index))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {formData.additionalImages.length < 3 && (
                      <div 
                        onClick={() => handleImageUpload('additional')}
                        className="w-full h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-teal-500"
                      >
                        <Plus className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tags for Search
              </label>
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-teal-600 hover:text-teal-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {commonTags.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="p-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-left"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price per Person (€) *
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.pricePerPerson}
                    onChange={(e) => updateFormData('pricePerPerson', e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (Hours) *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.durationHours}
                    onChange={(e) => updateFormData('durationHours', e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.minGuests}
                    onChange={(e) => updateFormData('minGuests', parseInt(e.target.value) || 1)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Guests *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.maxGuests}
                    onChange={(e) => updateFormData('maxGuests', e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting Point
              </label>
              <input
                type="text"
                value={formData.specificLocation}
                onChange={(e) => updateFormData('specificLocation', e.target.value)}
                placeholder="Exact address or meeting instructions"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Available Dates Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Available Dates *
                </label>
                <button
                  onClick={addAvailabilityDate}
                  className="flex items-center space-x-2 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Date</span>
                </button>
              </div>
              
              {formData.availabilityDates.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Add at least one available date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.availabilityDates.map((date, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded-lg">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          const updated = [...formData.availabilityDates];
                          updated[index] = e.target.value;
                          updateFormData('availabilityDates', updated);
                        }}
                        className="flex-1 text-sm border-none focus:outline-none"
                      />
                      <button
                        onClick={() => removeAvailabilityDate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Experience Itinerary *</h3>
              <button
                onClick={addItineraryItem}
                className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Step</span>
              </button>
            </div>

            {formData.itinerary.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Add at least 2 steps to your itinerary</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.itinerary.map((item, index) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700">Step {index + 1}</span>
                    </div>
                    <button
                      onClick={() => removeItineraryItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time/Duration
                      </label>
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => updateItineraryItem(item.id, 'time', e.target.value)}
                        placeholder="e.g., 9:00 AM or 30 minutes"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activity Title
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItineraryItem(item.id, 'title', e.target.value)}
                        placeholder="e.g., Safety briefing and equipment"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItineraryItem(item.id, 'description', e.target.value)}
                      placeholder="Brief description of what happens during this step..."
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows="2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What's Included *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenityOptions.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.includedAmenities.includes(amenity)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...formData.includedAmenities, amenity]
                          : formData.includedAmenities.filter(a => a !== amenity);
                        updateFormData('includedAmenities', updated);
                      }}
                      className="rounded text-teal-600"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What's NOT Included
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {notIncludedOptions.map((item) => (
                  <label key={item} className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.notIncludedItems.includes(item)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...formData.notIncludedItems, item]
                          : formData.notIncludedItems.filter(i => i !== item);
                        updateFormData('notIncludedItems', updated);
                      }}
                      className="rounded text-red-600"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What to Bring *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {bringOptions.map((item) => (
                  <label key={item} className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.whatToBring.includes(item)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...formData.whatToBring, item]
                          : formData.whatToBring.filter(i => i !== item);
                        updateFormData('whatToBring', updated);
                      }}
                      className="rounded text-teal-600"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Age
                </label>
                <input
                  type="number"
                  value={formData.minAge}
                  onChange={(e) => updateFormData('minAge', e.target.value)}
                  placeholder="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Age
                </label>
                <input
                  type="number"
                  value={formData.maxAge}
                  onChange={(e) => updateFormData('maxAge', e.target.value)}
                  placeholder="No limit"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Weather Contingency Plan
              </label>
              <textarea
                value={formData.weatherContingency}
                onChange={(e) => updateFormData('weatherContingency', e.target.value)}
                placeholder="What happens in case of bad weather? Refund policy, rescheduling options, etc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows="3"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {/* Cancellation Policy */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Cancellation Policy *
              </label>
              <div className="space-y-3">
                {cancellationPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    onClick={() => updateFormData('cancellationPolicy', policy.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.cancellationPolicy === policy.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{policy.label}</h4>
                        <p className="text-sm text-gray-600">{policy.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.cancellationPolicy === policy.id
                          ? 'bg-teal-500 border-teal-500'
                          : 'border-gray-300'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Cancellation Details
              </label>
              <textarea
                value={formData.cancellationDetails}
                onChange={(e) => updateFormData('cancellationDetails', e.target.value)}
                placeholder="Any additional details about your cancellation policy, exceptions, or special circumstances..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows="3"
              />
            </div>

            {/* FAQ Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Frequently Asked Questions *
                </label>
                <button
                  onClick={addFaqItem}
                  className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add FAQ</span>
                </button>
              </div>

              {formData.faqItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <HelpCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Add at least 2 frequently asked questions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.faqItems.map((faq, index) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">FAQ {index + 1}</h4>
                        <button
                          onClick={() => removeFaqItem(faq.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaqItem(faq.id, 'question', e.target.value)}
                            placeholder="e.g., What should I bring?"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Answer
                          </label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => updateFaqItem(faq.id, 'answer', e.target.value)}
                            placeholder="Provide a clear, helpful answer..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            {/* Experience Preview Card */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <div className="flex space-x-4 mb-4">
                {formData.primaryImageUrl && (
                  <img 
                    src={formData.primaryImageUrl} 
                    alt="Experience" 
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{formData.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{formData.durationHours} hours</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{formData.minGuests}-{formData.maxGuests} guests</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Euro className="h-4 w-4 text-gray-500" />
                      <span>€{formData.pricePerPerson} per person</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 mb-4">{formData.shortDescription}</p>
              {formData.fullDescription && (
                <p className="text-gray-600 text-sm">{formData.fullDescription}</p>
              )}
            </div>

            {formData.availabilityDates.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Available Dates</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.availabilityDates.slice(0, 5).map((date, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {new Date(date).toLocaleDateString()}
                    </span>
                  ))}
                  {formData.availabilityDates.length > 5 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      +{formData.availabilityDates.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {formData.itinerary.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Itinerary</h4>
                <div className="space-y-3">
                  {formData.itinerary.map((item, index) => (
                    <div key={item.id} className="flex space-x-3">
                      <div className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {item.time && <div className="text-sm text-gray-500">{item.time}</div>}
                        {item.description && <div className="text-sm text-gray-700">{item.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.includedAmenities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What's Included</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {formData.includedAmenities.map(amenity => (
                      <li key={amenity} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {formData.notIncludedItems.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What's NOT Included</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {formData.notIncludedItems.map(item => (
                      <li key={item} className="flex items-center space-x-2">
                        <X className="h-4 w-4 text-red-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {formData.whatToBring.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What to Bring</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.whatToBring.map(item => (
                    <span key={item} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.cancellationPolicy && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h4>
                <p className="text-sm text-gray-700">
                  {cancellationPolicies.find(p => p.id === formData.cancellationPolicy)?.description}
                </p>
                {formData.cancellationDetails && (
                  <p className="text-sm text-gray-600 mt-2">{formData.cancellationDetails}</p>
                )}
              </div>
            )}

            {formData.faqItems.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">FAQ</h4>
                <div className="space-y-3">
                  {formData.faqItems.map((faq, index) => (
                    <div key={faq.id}>
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {expandedFaq === faq.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => updateFormData('isActive', e.target.checked)}
                className="rounded text-teal-600"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Publish this experience (make it visible to customers)
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < 7 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement adventure creation API call
      console.log('Adventure created:', formData);
      
      toast({
        title: "Success!",
        description: "Your adventure has been created successfully.",
      });
      
      router.push("/business/adventures");
    } catch (error) {
      console.error('Error creating adventure:', error);
      toast({
        title: "Error",
        description: "Failed to create adventure. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAsDraft = async () => {
    try {
      // TODO: Implement save as draft API call
      console.log('Saved as draft:', formData);
      
      toast({
        title: "Draft Saved!",
        description: "Your adventure has been saved as a draft.",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <BusinessProtectedRoute>
      <BusinessLayout>
        <div className="max-w-5xl mx-auto p-6 bg-white min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/business/adventures">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Adventures
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Adventure</h1>
            <p className="text-gray-600">Build an amazing experience that travelers will love. Use our AI assistant to help you along the way!</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      currentStep === step.id
                        ? 'bg-teal-600 text-white'
                        : completedSteps.has(step.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {completedSteps.has(step.id) && currentStep !== step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="ml-3 hidden lg:block">
                    <div className={`text-sm font-medium whitespace-nowrap ${currentStep === step.id ? 'text-teal-600' : 'text-gray-700'}`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-gray-400 mx-4 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {steps.find(s => s.id === currentStep)?.title}
              </h2>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 7) * 100}%` }}
                />
              </div>
            </div>

            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={saveAsDraft}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Save Draft
              </button>
              
              <div className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </div>
            </div>

            {currentStep < 7 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  validateStep(currentStep)
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Publish Adventure</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Validation Messages */}
          {!validateStep(currentStep) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Please complete all required fields to continue
                </span>
              </div>
            </div>
          )}
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  );
};

export default function NewAdventurePage() {
  return <ExperienceCreationForm />;
}
