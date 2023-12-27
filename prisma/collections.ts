import { PlanLimitName, PlanLimits, PlanName, UserRole } from '@prisma/client';

export const GALLERY_TYPES = [
  { typeName: 'Museum stores, museum galleries, antique art gallery' },
  { typeName: 'Non-profit galleries' },
  { typeName: 'Private galleries' },
  { typeName: 'Public galleries' },
  { typeName: 'Amateur galleries' },
  { typeName: 'Online galleries, virtual gallery' },
  { typeName: 'Curatorial Galleries' },
  { typeName: 'Art spaces, street gallery' },
  { typeName: 'Art salons and fairs' },
  { typeName: 'Art Centers and Cultural Centers' },
  { typeName: 'Artist residencies' },
  { typeName: 'Art Centers' },
  {
    typeName:
      'Commercial galleries, commission galleries, agent galleries, distributor galleries, exhibition and auction spaces, art dealer studios and galleries, auction houses, gallery store, galleries engaged only in the sale or rental of artworks',
  },
];

export const ART_ORIENTATION = [
  { orientationName: 'Gallery of fine arts' },
  {
    orientationName: 'Sculpture, design',
  },
  { orientationName: 'Arts and crafts' },
  { orientationName: 'Digital painting' },
  { orientationName: 'Pixel art' },
  { orientationName: 'Demoscene' },
  { orientationName: 'Contemporary art galleries' },
];

export const CLASSIFICATIONS_FOR_GALLERIES = [
  { classificationName: 'Galleries for emerging artists' },
  { classificationName: 'Galleries for established artists' },
  { classificationName: 'National Art Galleries' },
  { classificationName: 'Art Galleries' },
  { classificationName: 'Photography galleries' },
  { classificationName: 'Modern art galleries' },
  { classificationName: 'Classical art galleries' },
  {
    classificationName: 'Ethnic Art Galleries; Galleries of Ethnic Art',
  },
  { classificationName: 'Sculpture, design and architecture galleries' },
  { classificationName: 'Specialized Galleries' },
  { classificationName: 'Mixed galleries' },
  { classificationName: 'Multidisciplinary Gallery' },
  { classificationName: 'Painting' },
  { classificationName: 'Photo' },
  { classificationName: 'Conceptual art' },
  { classificationName: 'Figurative art' },
  { classificationName: 'Experimental Art' },
  { classificationName: 'Art Minimalism' },
  { classificationName: 'Art-modernism' },
  { classificationName: 'Art-postmodernism' },
  { classificationName: 'Art Romantics' },
  { classificationName: 'Art avant-garde' },
  { classificationName: 'Architects, installation artists' },
  { classificationName: 'Installation Artists' },
  { classificationName: 'Caricatures, portraits' },
  {
    classificationName:
      'Ceramists, lithographers, restorers, sculptors, model makers, decorative artists',
  },
  { classificationName: 'Collage' },
  { classificationName: 'Landscape' },
  { classificationName: 'Performance Art' },
  { classificationName: 'Textile Art' },
  { classificationName: 'Street Art' },
  { classificationName: 'Animalism' },
  { classificationName: 'Hyperrealists' },
  { classificationName: 'Modernism' },
  { classificationName: 'Still life' },
  { classificationName: 'Surrealism' },
  { classificationName: 'Expressionism' },
  { classificationName: 'Historical painting' },
  { classificationName: 'Graphics' },
  { classificationName: 'Religious painting' },
  { classificationName: 'Mythological painting' },
  { classificationName: 'Installation' },
  { classificationName: 'Digital Art' },
  { classificationName: 'Realism' },
  { classificationName: 'Impressionism' },
  { classificationName: 'Expressionism' },
  { classificationName: 'Cubism' },
  { classificationName: 'Surrealism' },
  { classificationName: 'Pop Art' },
  { classificationName: 'Abstractionism' },
  { classificationName: 'Fauvism' },
  { classificationName: 'Modernism' },
  { classificationName: 'Romanticism' },
  { classificationName: 'Classicism' },
  { classificationName: 'Baroque' },
  { classificationName: 'Renaissance' },
  { classificationName: 'Symbolism' },
  { classificationName: 'Dadaism' },
  { classificationName: 'Naturalism' },
  { classificationName: 'Post-Impressionism' },
  { classificationName: 'Minimalism' },
  { classificationName: 'Neorealism' },
  { classificationName: 'Futurism' },
];

export const CLASSIFICATION_FOR_PAINTER = [
  { classificationName: 'Painters' },
  { classificationName: 'Photo artists, photographers' },
  {
    classificationName:
      'Designers, illustrators, graphic artists, animators, visual artists',
  },
  { classificationName: 'Conceptual artists' },
  { classificationName: 'Abstract artists, abstraction artists' },
  { classificationName: 'Figurative artists' },
  { classificationName: 'Naive artists' },
  { classificationName: 'Self-taught artists' },
  { classificationName: 'Professional artists' },
  { classificationName: 'Experimental artists' },
  { classificationName: 'Academic Artists' },
  { classificationName: 'Impressionist artists' },
  { classificationName: 'Minimalist painters' },
  { classificationName: 'Modernist artists' },
  { classificationName: 'Postmodernist artists' },
  { classificationName: 'Romantic Artists' },
  { classificationName: 'Avant-garde artists' },
  { classificationName: 'Architects, installation artists' },
  { classificationName: 'Installation Artists' },
  { classificationName: 'Caricaturists, portrait painters' },
  {
    classificationName: 'Ceramists, lithographers, restorers, sculptors',
  },
  { classificationName: 'Model makers, decorative artists' },
  { classificationName: 'Collage Artists' },
  { classificationName: 'Landscape Artists' },
  { classificationName: 'Performance Artists' },
  { classificationName: 'Textile artists' },
  { classificationName: 'Street artists' },
  { classificationName: 'Abstract Artists' },
  { classificationName: 'Animal painters' },
  { classificationName: 'Hyperrealist artists' },
  { classificationName: 'Painters' },
  { classificationName: 'Marinist painters' },
  { classificationName: 'Modernist painters' },
  { classificationName: 'Still Life Artists' },
  { classificationName: 'Neo-Romantic Artists' },
  { classificationName: 'Realist Painters' },
  { classificationName: 'Surrealist painters' },
  { classificationName: 'Expressionist artists' },
  { classificationName: 'Neorealism' },
  { classificationName: 'Futurism' },
  { classificationName: 'Fauvism' },
  { classificationName: 'Modernism' },
  { classificationName: 'Romanticism' },
  { classificationName: 'Classicism' },
  { classificationName: 'Baroque' },
  { classificationName: 'Renaissance' },
  { classificationName: 'Symbolism' },
  { classificationName: 'Dadaism' },
  { classificationName: 'Naturalism' },
  { classificationName: 'Post-Impressionism' },
  { classificationName: 'Religious painting' },
  { classificationName: 'Mythological painting' },
  { classificationName: 'Installation' },
  { classificationName: 'Digital Art' },
  { classificationName: 'Realism' },
  { classificationName: 'Impressionism' },
  { classificationName: 'Expressionism' },
  { classificationName: 'Cubism' },
];

export const CLASSIFICATION_COMMON = [{ classificationName: 'other' }];

export const ART_CLASSIFICATIONS = [
  ...CLASSIFICATIONS_FOR_GALLERIES,
  ...CLASSIFICATION_COMMON,
  ...CLASSIFICATION_FOR_PAINTER,
];

export const STANDARD_PLAN = {
  id: 1,
  durationDays: null,
  planName: PlanName.STANDARD,
  price: 0,
};

export const PREMIUM_PLAN = {
  id: 2,
  planName: PlanName.PREMIUM,
  price: 30,
};

export const PLANS = [STANDARD_PLAN, PREMIUM_PLAN];

export const STANDARD_PLAN_LIMITS: Omit<PlanLimits, 'id'>[] = [
  {
    limit: 1,
    days: 1,
    name: PlanLimitName.FAVORITE,
    planId: STANDARD_PLAN.id,
  },
  {
    limit: 1,
    days: 1,
    name: PlanLimitName.TOP_PICKS,
    planId: STANDARD_PLAN.id,
  },
  {
    limit: 25,
    days: 1,
    name: PlanLimitName.LIKE,
    planId: STANDARD_PLAN.id,
  },
  {
    limit: 1,
    days: 1,
    name: PlanLimitName.REWIND,
    planId: STANDARD_PLAN.id,
  },
  {
    limit: 0,
    days: null,
    name: PlanLimitName.SUPER_LIKE,
    planId: STANDARD_PLAN.id,
  },
  {
    limit: 0,
    days: null,
    name: PlanLimitName.BOOST,
    planId: STANDARD_PLAN.id,
  },
  {
    limit: 0,
    days: null,
    name: PlanLimitName.DOUBLE_LIKE,
    planId: STANDARD_PLAN.id,
  },
];

export const PREMIUM_PLAN_LIMITS: Omit<PlanLimits, 'id'>[] = [
  {
    limit: 1,
    days: 30,
    name: PlanLimitName.DOUBLE_LIKE,
    planId: PREMIUM_PLAN.id,
  },
  {
    limit: 10,
    days: 10,
    name: PlanLimitName.BOOST,
    planId: PREMIUM_PLAN.id,
  },
  {
    limit: null,
    days: null,
    name: PlanLimitName.FAVORITE,
    planId: PREMIUM_PLAN.id,
  },
  {
    limit: 10,
    days: 1,
    name: PlanLimitName.TOP_PICKS,
    planId: PREMIUM_PLAN.id,
  },
  {
    limit: null,
    days: null,
    name: PlanLimitName.LIKE,
    planId: PREMIUM_PLAN.id,
  },
  {
    limit: null,
    days: null,
    name: PlanLimitName.REWIND,
    planId: PREMIUM_PLAN.id,
  },
  {
    limit: 10,
    days: 10,
    name: PlanLimitName.SUPER_LIKE,
    planId: PREMIUM_PLAN.id,
  },
];

export const APPLICATION_SETTINGS = {
  id: 1,
  likeExpirationDays: 30,
  unLikeExpirationDays: 30,
  boostExpirationMinutes: 30,
  classificationsPremiumLimits: null,
  classificationsLimits: 5,
  premiumTrialDays: 7,
};

export const ARTIST_PROGRESS_PERCENTAGE = {
  name: 10,
  role: UserRole.ARTIST,
  email: 10,
  phoneNumber: 10,
  country: 10,
  city: 10,
  age: 5,
  gender: 5,
  artClassifications: 15,
  profileDescription: 25,
  galleryName: null,
  galleryType: null,
};

export const GALLERY_PROGRESS_PERCENTAGE = {
  name: 10,
  role: UserRole.GALLERY,
  email: 10,
  phoneNumber: 10,
  galleryName: 5,
  country: 5,
  city: 10,
  galleryType: 10,
  artClassifications: 15,
  profileDescription: 25,
  age: null,
  gender: null,
};

export const COLLECTOR_PROGRESS_PERCENTAGE = {
  name: 10,
  role: UserRole.COLLECTOR,
  email: 10,
  phoneNumber: 30,
  country: 5,
  city: 5,
  age: 5,
  gender: 5,
  profileDescription: 30,
  galleryName: null,
  galleryType: null,
  artClassifications: null,
};

export const PROGRESS_PERCENTAGE = [
  ARTIST_PROGRESS_PERCENTAGE,
  GALLERY_PROGRESS_PERCENTAGE,
  COLLECTOR_PROGRESS_PERCENTAGE,
];
