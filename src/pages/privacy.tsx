import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <h1 className="text-4xl font-light text-slate-900 dark:text-white mb-2 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Information We Collect</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Account information (email, password)
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Profile information (name, current role, location, social links)
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Career objectives and goals
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Resume files and related documents
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Usage data and analytics
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Provide, maintain, and improve our services
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Generate personalized career recommendations using AI
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Analyze your resume and provide feedback
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Send you updates and marketing communications (with your consent)
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Respond to your comments and questions
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Detect and prevent fraud and abuse
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. AI Processing</h2>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                  We use Anthropic's Claude AI to process your career information and provide recommendations. Your data is sent to Anthropic's API for processing. Anthropic does not use your data to train their models. Please review Anthropic's privacy policy for more information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Data Storage and Security</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Your data is stored securely using Supabase, which provides enterprise-grade security. We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-green-800 dark:text-green-200">
                    <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                    Encryption in transit and at rest
                  </li>
                  <li className="flex items-start gap-2 text-green-800 dark:text-green-200">
                    <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                    Regular security audits
                  </li>
                  <li className="flex items-start gap-2 text-green-800 dark:text-green-200">
                    <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                    Access controls and authentication
                  </li>
                  <li className="flex items-start gap-2 text-green-800 dark:text-green-200">
                    <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                    Regular backups
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    With your explicit consent
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    With service providers (Supabase, Anthropic) who assist in providing our services
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    To comply with legal obligations
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    To protect our rights and prevent fraud
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Your Rights (GDPR)</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                If you are in the European Economic Area, you have the following rights:
              </p>
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                    <span className="text-purple-600 dark:text-purple-500 mt-1">•</span>
                    Right to access your personal data
                  </li>
                  <li className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                    <span className="text-purple-600 dark:text-purple-500 mt-1">•</span>
                    Right to rectification of inaccurate data
                  </li>
                  <li className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                    <span className="text-purple-600 dark:text-purple-500 mt-1">•</span>
                    Right to erasure ("right to be forgotten")
                  </li>
                  <li className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                    <span className="text-purple-600 dark:text-purple-500 mt-1">•</span>
                    Right to restrict processing
                  </li>
                  <li className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                    <span className="text-purple-600 dark:text-purple-500 mt-1">•</span>
                    Right to data portability
                  </li>
                  <li className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                    <span className="text-purple-600 dark:text-purple-500 mt-1">•</span>
                    Right to object to processing
                  </li>
                  <li className="flex items-start gap-2 text-purple-800 dark:text-purple-200">
                    <span className="text-purple-600 dark:text-purple-500 mt-1">•</span>
                    Right to withdraw consent
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Data Retention</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and data at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. Cookies and Tracking</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">9. Children's Privacy</h2>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                  Our service is not intended for anyone under the age of 18. We do not knowingly collect personal information from children under 18.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">11. Contact Us</h2>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                  If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
                </p>
                <div className="space-y-1">
                  <p className="text-slate-700 dark:text-slate-300">
                    Email:{' '}
                    <a href="mailto:privacy@traiblix.com" className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                      privacy@traiblix.com
                    </a>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    Data Protection Officer:{' '}
                    <a href="mailto:dpo@traiblix.com" className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                      dpo@traiblix.com
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}