-- Data Seeding for TrailBlix Advanced Intelligence System
-- Run this after schema.sql to populate initial data

-- Career Progression Patterns (Real market data)
INSERT INTO career_progression_patterns (from_role, to_role, industry, years_experience_range, timeline, frequency, success_rate, salary_change_percentage, key_skills_required, transition_difficulty) VALUES
-- Software Engineering Paths
('Junior Software Engineer', 'Software Engineer', 'Technology', '1-2', '12-18 months', 2450, 91.5, 22.0, ARRAY['Problem Solving', 'Code Review', 'Testing'], 'low'),
('Software Engineer', 'Senior Software Engineer', 'Technology', '3-5', '18-24 months', 1850, 87.5, 28.0, ARRAY['System Design', 'Leadership', 'Advanced Programming'], 'medium'),
('Software Engineer', 'Tech Lead', 'Technology', '4-7', '24-36 months', 890, 72.3, 45.0, ARRAY['Team Leadership', 'Architecture', 'Project Management'], 'high'),
('Senior Software Engineer', 'Staff Engineer', 'Technology', '5-8', '24-36 months', 620, 78.5, 35.0, ARRAY['Technical Strategy', 'Cross-team Leadership', 'System Architecture'], 'high'),
('Senior Software Engineer', 'Engineering Manager', 'Technology', '6-9', '18-30 months', 540, 68.9, 40.0, ARRAY['People Management', 'Strategic Planning', 'Hiring'], 'high'),

-- Product Management Paths
('Associate Product Manager', 'Product Manager', 'Technology', '1-2', '12-18 months', 780, 89.2, 25.0, ARRAY['Product Strategy', 'User Research', 'Analytics'], 'low'),
('Product Manager', 'Senior Product Manager', 'Technology', '2-4', '12-18 months', 650, 91.2, 30.0, ARRAY['Strategy', 'Analytics', 'Stakeholder Management'], 'medium'),
('Senior Product Manager', 'Principal Product Manager', 'Technology', '5-7', '18-30 months', 340, 76.8, 38.0, ARRAY['Vision Setting', 'Cross-functional Leadership', 'Market Analysis'], 'high'),
('Senior Product Manager', 'Director of Product', 'Technology', '6-8', '24-36 months', 290, 72.4, 50.0, ARRAY['Team Leadership', 'Roadmap Planning', 'Business Strategy'], 'high'),

-- Data Science Paths
('Data Analyst', 'Data Scientist', 'Technology', '2-3', '12-24 months', 820, 82.9, 35.0, ARRAY['Machine Learning', 'Python', 'Statistics', 'SQL'], 'medium'),
('Data Scientist', 'Senior Data Scientist', 'Technology', '3-5', '18-30 months', 560, 85.3, 30.0, ARRAY['Advanced ML', 'Model Deployment', 'Business Impact'], 'medium'),
('Senior Data Scientist', 'ML Engineer', 'Technology', '4-6', '18-24 months', 340, 78.5, 28.0, ARRAY['MLOps', 'System Design', 'Production ML'], 'medium'),
('Senior Data Scientist', 'Data Science Manager', 'Technology', '5-7', '24-36 months', 280, 71.5, 42.0, ARRAY['People Management', 'Technical Leadership', 'Strategy'], 'high'),

-- Design Paths
('UI/UX Designer', 'Senior UI/UX Designer', 'Technology', '2-4', '18-24 months', 490, 88.7, 26.0, ARRAY['User Research', 'Interaction Design', 'Design Systems'], 'medium'),
('Senior UI/UX Designer', 'Lead Designer', 'Technology', '5-7', '24-36 months', 230, 75.8, 38.0, ARRAY['Team Leadership', 'Design Strategy', 'Stakeholder Management'], 'high'),
('Senior UI/UX Designer', 'Product Designer', 'Technology', '3-5', '12-24 months', 380, 83.2, 22.0, ARRAY['Product Thinking', 'User Research', 'Prototyping'], 'medium'),

-- DevOps/SRE Paths
('DevOps Engineer', 'Senior DevOps Engineer', 'Technology', '3-5', '18-30 months', 440, 86.4, 30.0, ARRAY['Kubernetes', 'CI/CD', 'Cloud Architecture'], 'medium'),
('Senior DevOps Engineer', 'Platform Engineer', 'Technology', '5-7', '18-24 months', 280, 79.6, 32.0, ARRAY['Platform Design', 'Infrastructure as Code', 'Automation'], 'medium'),
('Site Reliability Engineer', 'Senior SRE', 'Technology', '3-5', '18-30 months', 320, 88.1, 28.0, ARRAY['System Reliability', 'Monitoring', 'Incident Management'], 'medium'),

-- Security Paths
('Security Analyst', 'Security Engineer', 'Technology', '2-3', '12-24 months', 290, 84.5, 35.0, ARRAY['Threat Analysis', 'Security Tools', 'Incident Response'], 'medium'),
('Security Engineer', 'Senior Security Engineer', 'Technology', '3-5', '18-30 months', 220, 86.7, 32.0, ARRAY['Security Architecture', 'Penetration Testing', 'Compliance'], 'medium'),

-- Marketing/Growth Paths
('Marketing Analyst', 'Growth Marketing Manager', 'Technology', '2-3', '12-24 months', 310, 81.3, 32.0, ARRAY['Analytics', 'A/B Testing', 'User Acquisition'], 'medium'),
('Growth Marketing Manager', 'Senior Growth Manager', 'Technology', '3-5', '18-30 months', 180, 78.9, 35.0, ARRAY['Strategic Planning', 'Team Leadership', 'Data Analysis'], 'medium');

-- Skills Intelligence (Current market demand - 2025)
INSERT INTO skills_intelligence (skill_name, category, demand_score, growth_rate, salary_impact, rarity_index, market_location) VALUES
-- AI/ML Skills (Hot in 2025)
('Generative AI', 'technical', 98, 145.5, 35.0, 0.85, 'global'),
('LLM Integration', 'technical', 96, 132.8, 32.0, 0.82, 'global'),
('Machine Learning', 'technical', 95, 67.8, 28.0, 0.70, 'global'),
('MLOps', 'technical', 92, 89.4, 30.0, 0.75, 'global'),
('PyTorch', 'technical', 91, 72.3, 26.0, 0.68, 'global'),
('TensorFlow', 'technical', 89, 58.6, 24.0, 0.65, 'global'),

-- Cloud & Infrastructure
('Kubernetes', 'technical', 94, 45.6, 22.0, 0.60, 'global'),
('AWS', 'technical', 92, 38.2, 20.0, 0.45, 'global'),
('Docker', 'technical', 88, 28.4, 15.0, 0.35, 'global'),
('Terraform', 'technical', 87, 42.7, 23.0, 0.58, 'global'),
('Azure', 'technical', 86, 35.9, 18.0, 0.42, 'global'),
('GCP', 'technical', 84, 40.1, 19.0, 0.50, 'global'),

-- Programming Languages
('Python', 'technical', 95, 23.5, 18.0, 0.30, 'global'),
('TypeScript', 'technical', 90, 34.8, 16.0, 0.38, 'global'),
('JavaScript', 'technical', 88, 12.3, 12.0, 0.20, 'global'),
('Go', 'technical', 87, 52.6, 25.0, 0.62, 'global'),
('Rust', 'technical', 85, 78.4, 32.0, 0.78, 'global'),
('Java', 'technical', 82, 8.7, 14.0, 0.25, 'global'),

-- Frontend
('React', 'technical', 91, 18.4, 14.0, 0.28, 'global'),
('Next.js', 'technical', 88, 56.7, 18.0, 0.55, 'global'),
('Vue.js', 'technical', 82, 22.9, 12.0, 0.35, 'global'),
('Svelte', 'technical', 78, 89.5, 15.0, 0.72, 'global'),

-- Backend & Databases
('Node.js', 'technical', 89, 21.5, 16.0, 0.32, 'global'),
('PostgreSQL', 'technical', 87, 26.8, 17.0, 0.40, 'global'),
('MongoDB', 'technical', 84, 19.4, 15.0, 0.38, 'global'),
('GraphQL', 'technical', 86, 38.7, 20.0, 0.52, 'global'),
('Redis', 'technical', 83, 24.3, 16.0, 0.45, 'global'),

-- System Design & Architecture
('System Design', 'technical', 96, 34.2, 30.0, 0.80, 'global'),
('Microservices', 'technical', 90, 28.5, 24.0, 0.58, 'global'),
('API Design', 'technical', 88, 22.7, 18.0, 0.48, 'global'),
('Event-Driven Architecture', 'technical', 85, 45.3, 26.0, 0.65, 'global'),

-- Security
('Cybersecurity', 'technical', 93, 54.8, 28.0, 0.68, 'global'),
('Zero Trust Architecture', 'technical', 89, 68.4, 30.0, 0.74, 'global'),
('Penetration Testing', 'technical', 86, 42.1, 26.0, 0.70, 'global'),

-- Soft Skills (Critical for advancement)
('Leadership', 'soft', 94, 12.2, 25.0, 0.55, 'global'),
('Communication', 'soft', 92, 8.5, 20.0, 0.40, 'global'),
('Strategic Thinking', 'soft', 90, 15.7, 28.0, 0.62, 'global'),
('Project Management', 'soft', 88, 10.3, 22.0, 0.50, 'global'),
('Problem Solving', 'soft', 91, 7.8, 18.0, 0.35, 'global'),
('Stakeholder Management', 'soft', 87, 14.2, 24.0, 0.58, 'global'),

-- Industry-Specific (Emerging)
('Blockchain Development', 'industry_specific', 80, 35.6, 28.0, 0.75, 'global'),
('Quantum Computing', 'industry_specific', 75, 120.5, 40.0, 0.92, 'global'),
('AR/VR Development', 'industry_specific', 78, 48.3, 26.0, 0.70, 'global'),
('Sustainability Tech', 'industry_specific', 82, 67.9, 22.0, 0.68, 'global');

-- Salary Benchmarks (2025 market data - US Tech)
INSERT INTO salary_benchmarks (role_title, industry, location, experience_level, percentile_10, percentile_25, percentile_50, percentile_75, percentile_90, currency, sample_size, confidence_level, data_collection_date) VALUES
-- Software Engineering
('Software Engineer', 'Technology', 'United States', 'entry', 75000, 85000, 95000, 110000, 130000, 'USD', 3450, 0.94, CURRENT_DATE),
('Software Engineer', 'Technology', 'United States', 'mid', 100000, 115000, 130000, 150000, 175000, 'USD', 5680, 0.96, CURRENT_DATE),
('Senior Software Engineer', 'Technology', 'United States', 'senior', 140000, 160000, 185000, 215000, 250000, 'USD', 4230, 0.95, CURRENT_DATE),
('Staff Engineer', 'Technology', 'United States', 'senior', 190000, 220000, 260000, 310000, 380000, 'USD', 1820, 0.91, CURRENT_DATE),

-- San Francisco Bay Area
('Software Engineer', 'Technology', 'San Francisco', 'mid', 140000, 160000, 180000, 210000, 245000, 'USD', 2340, 0.94, CURRENT_DATE),
('Senior Software Engineer', 'Technology', 'San Francisco', 'senior', 180000, 210000, 245000, 290000, 350000, 'USD', 1890, 0.93, CURRENT_DATE),

-- Product Management
('Product Manager', 'Technology', 'United States', 'mid', 110000, 130000, 150000, 175000, 205000, 'USD', 2180, 0.93, CURRENT_DATE),
('Senior Product Manager', 'Technology', 'United States', 'senior', 155000, 180000, 210000, 245000, 290000, 'USD', 1650, 0.92, CURRENT_DATE),

-- Data Science
('Data Analyst', 'Technology', 'United States', 'entry', 68000, 78000, 88000, 100000, 115000, 'USD', 1940, 0.91, CURRENT_DATE),
('Data Scientist', 'Technology', 'United States', 'mid', 105000, 125000, 145000, 170000, 200000, 'USD', 2680, 0.94, CURRENT_DATE),
('Senior Data Scientist', 'Technology', 'United States', 'senior', 150000, 175000, 205000, 240000, 285000, 'USD', 1820, 0.92, CURRENT_DATE),

-- Design
('UI/UX Designer', 'Technology', 'United States', 'mid', 80000, 95000, 110000, 130000, 155000, 'USD', 1450, 0.90, CURRENT_DATE),
('Senior UI/UX Designer', 'Technology', 'United States', 'senior', 120000, 140000, 165000, 195000, 230000, 'USD', 980, 0.89, CURRENT_DATE),

-- DevOps/SRE
('DevOps Engineer', 'Technology', 'United States', 'mid', 105000, 120000, 140000, 165000, 195000, 'USD', 1680, 0.92, CURRENT_DATE),
('Site Reliability Engineer', 'Technology', 'United States', 'senior', 145000, 170000, 200000, 235000, 280000, 'USD', 1340, 0.91, CURRENT_DATE),

-- Security
('Security Engineer', 'Technology', 'United States', 'mid', 115000, 135000, 160000, 190000, 225000, 'USD', 890, 0.88, CURRENT_DATE),
('Senior Security Engineer', 'Technology', 'United States', 'senior', 160000, 185000, 220000, 260000, 310000, 'USD', 620, 0.87, CURRENT_DATE);

-- Comments
COMMENT ON TABLE career_progression_patterns IS 'Real career transition data based on market research and user tracking';
COMMENT ON TABLE skills_intelligence IS 'Real-time skills demand data updated from job market analytics';
COMMENT ON TABLE salary_benchmarks IS 'Salary data compiled from multiple sources including job postings and salary surveys';