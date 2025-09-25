    import { Brain, Target, TrendingUp, Zap, BarChart3, MapPin, Clock, Sparkles, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react'
    import { useState } from 'react'

    export default function FeaturesSection() {
    const [activeFeature, setActiveFeature] = useState(0)

    const features = [
        {
        title: 'Predictive Career Modeling',
        subtitle: 'AI forecasts your career trajectory',
        visual: (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="mb-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Career Projection • Next 24 months</div>
                <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Current: Software Engineer</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">£85,000</div>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-500">Now</div>
                </div>
                <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-blue-300 dark:from-slate-700 dark:to-blue-700" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Projected: Senior Engineer</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">£125,000 (+47%)</div>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500">18 months</div>
                </div>
                </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 p-2 rounded">
                94% accuracy • Based on 12,000+ similar profiles
            </div>
            </div>
        )
        },
        {
        title: 'Smart Job Matching',
        subtitle: 'Beyond keywords - strategic fit analysis',
        visual: (
            <div className="space-y-3">
            {[
                { company: 'Monzo', role: 'Staff Engineer', match: 96, salary: '£120-140k', culture: 'Perfect fit', growth: '+23%' },
                { company: 'Revolut', role: 'Principal Dev', match: 91, salary: '£110-130k', culture: 'Good fit', growth: '+18%' },
                { company: 'Stripe', role: 'Tech Lead', match: 89, salary: '£115-135k', culture: 'Great fit', growth: '+21%' }
            ].map((job, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between mb-2">
                    <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{job.role}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{job.company}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                    job.match >= 95 ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                    job.match >= 90 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                    }`}>
                    {job.match}% match
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                    <div className="text-slate-500 dark:text-slate-600">Salary</div>
                    <div className="font-medium text-slate-900 dark:text-white">{job.salary}</div>
                    </div>
                    <div>
                    <div className="text-slate-500 dark:text-slate-600">Culture</div>
                    <div className="font-medium text-slate-900 dark:text-white">{job.culture}</div>
                    </div>
                    <div>
                    <div className="text-slate-500 dark:text-slate-600">Growth</div>
                    <div className="font-medium text-green-600 dark:text-green-500">{job.growth}</div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )
        },
        {
        title: 'Skills Market Intelligence',
        subtitle: 'Real-time demand tracking & forecasting',
        visual: (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="mb-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">Market Demand Trends</div>
                <div className="space-y-3">
                {[
                    { skill: 'Kubernetes', trend: '+47%', color: 'green', time: '3 months' },
                    { skill: 'GraphQL', trend: '+31%', color: 'green', time: '6 weeks' },
                    { skill: 'TypeScript', trend: '+12%', color: 'blue', time: '4 weeks' },
                    { skill: 'jQuery', trend: '-23%', color: 'red', time: 'Declining' }
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{item.skill}</div>
                        <div className="flex items-center gap-1">
                        {item.color === 'green' && <ChevronUp className="w-3 h-3 text-green-600" />}
                        {item.color === 'red' && <ChevronDown className="w-3 h-3 text-red-600" />}
                        <span className={`text-xs font-medium ${
                            item.color === 'green' ? 'text-green-600 dark:text-green-500' :
                            item.color === 'red' ? 'text-red-600 dark:text-red-500' :
                            'text-blue-600 dark:text-blue-500'
                        }`}>
                            {item.trend}
                        </span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-600">{item.time}</div>
                    </div>
                ))}
                </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-600 bg-slate-50 dark:bg-slate-950 p-2 rounded">
                Updated hourly • 47,000+ job postings analyzed
            </div>
            </div>
        )
        },
        {
        title: 'Career Transition Mapping',
        subtitle: 'AI-guided pathways between roles',
        visual: (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="text-sm font-medium text-slate-900 dark:text-white">Frontend Developer</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Current role</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                {[
                    { role: 'Full Stack', time: '6 months', difficulty: 'Easy' },
                    { role: 'Tech Lead', time: '12 months', difficulty: 'Medium' },
                    { role: 'Product Eng', time: '8 months', difficulty: 'Medium' }
                ].map((path, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-900 dark:text-white">{path.role}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{path.time}</div>
                    <div className={`text-xs px-2 py-1 rounded mt-2 ${
                        path.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                    }`}>
                        {path.difficulty}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        )
        }
    ]

    return (
        <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            {/* Section header */}
            <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-400 mb-6 bg-white dark:bg-slate-950">
                <Sparkles size={16} />
                See it in action
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-white tracking-tight mb-4">
                Intelligence you can
                <span className="block font-medium text-blue-600 dark:text-blue-500">see and understand</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
                Don't just take our word for it. See exactly how our AI delivers career insights.
            </p>
            </div>

            {/* Interactive feature showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Feature selector */}
            <div className="space-y-4">
                {features.map((feature, index) => (
                <div
                    key={index}
                    className={`cursor-pointer p-6 rounded-xl border transition-all ${
                    activeFeature === index
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                    onClick={() => setActiveFeature(index)}
                >
                    <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeFeature === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${
                        activeFeature === index
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                        {feature.title}
                        </h3>
                        <p className={`text-sm ${
                        activeFeature === index
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}>
                        {feature.subtitle}
                        </p>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            {/* Visual demonstration */}
            <div className="lg:sticky lg:top-8">
                <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    Live Preview
                    </div>
                    <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {features[activeFeature].title}
                    </h4>
                </div>
                
                <div className="min-h-[300px]">
                    {features[activeFeature].visual}
                </div>
                </div>
            </div>
            </div>

            {/* Bottom stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
                { value: '47K+', label: 'Jobs analyzed daily' },
                { value: '94%', label: 'Prediction accuracy' },
                { value: '12-18', label: 'Months forecasting' },
                { value: '15sec', label: 'Analysis speed' }
            ].map((stat, i) => (
                <div key={i}>
                <div className="text-2xl md:text-3xl font-semibold text-blue-600 dark:text-blue-500">{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{stat.label}</div>
                </div>
            ))}
            </div>
        </div>
        </section>
    )
    }