import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
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
          <h1 className="text-4xl font-light text-slate-900 dark:text-white mb-2 tracking-tight">Terms of Service</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Agreement to Terms</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                By accessing or using Traiblix, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Use License</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Permission is granted to temporarily use Traiblix for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Modify or copy the materials
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Use the materials for any commercial purpose
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Attempt to decompile or reverse engineer any software
                  </li>
                  <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mt-1">•</span>
                    Remove any copyright or proprietary notations
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. User Accounts</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms. You are responsible for safeguarding your password and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. AI Services</h2>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                  Traiblix uses artificial intelligence to provide career recommendations and resume analysis. While we strive for accuracy, AI-generated content should be used as guidance only and not as professional career advice. Users should verify all information and make their own informed decisions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. User Content</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                You retain all rights to any content you submit, post, or display on or through the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and process your content solely for providing the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Privacy and Data Protection</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Your use of Traiblix is also governed by our Privacy Policy. We are committed to protecting your personal information and complying with applicable data protection laws, including GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Termination</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. Limitation of Liability</h2>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                  In no event shall Traiblix or its suppliers be liable for any damages arising out of the use or inability to use the service, even if we have been notified of the possibility of such damages.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">9. Changes to Terms</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any changes by updating the &quot;Last updated&quot; date. Continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">10. Contact Information</h2>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  If you have any questions about these Terms, please contact us at{' '}
                  <a href="mailto:support@traiblix.com" className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                    support@traiblix.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}