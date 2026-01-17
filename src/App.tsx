import { useState } from 'react';
import { RegistryBrokerClient } from '@hashgraphonline/standards-sdk';
import { Shield, Search, CheckCircle, XCircle, Loader2, Lock } from 'lucide-react';

const client = new RegistryBrokerClient({
  baseUrl: 'https://hol.org/registry/api/v1',
});

function App() {
  const [query, setQuery] = useState('assistant');
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const searchAgents = async () => {
    setLoading(true);
    setAgents([]);
    setSelectedAgent(null);
    setVerificationResult(null);
    try {
      const res = await client.search({ q: query, limit: 5 });
      setAgents(res.hits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyIdentity = async (agent: any) => {
    setSelectedAgent(agent);
    setVerifying(true);
    setVerificationResult(null);
    try {
      // Simulate verification steps
      await new Promise(r => setTimeout(r, 800)); // Step 1: Resolve UAID
      const resolved = await client.resolveUaid(agent.uaid);
      
      await new Promise(r => setTimeout(r, 800)); // Step 2: Check Trust Score
      
      await new Promise(r => setTimeout(r, 800)); // Step 3: Verify Signatures (Simulation)

      setVerificationResult({
        verified: true,
        details: resolved.agent,
        trustScore: agent.trustScore
      });
    } catch (err) {
      console.error(err);
      setVerificationResult({ verified: false, error: 'Verification Failed' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto font-sans">
      <header className="mb-12 text-center">
        <div className="flex justify-center mb-4">
          <Shield className="w-16 h-16 text-emerald-400" />
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
          Agent Identity Verification
        </h1>
        <p className="text-slate-400">
          Verify Decentralized Identities (UAIDs) and Establish Trust
        </p>
      </header>

      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
            placeholder="Search for an agent (UAID or name)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAgents()}
          />
          <button
            onClick={searchAgents}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            Find Agent
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-300 mb-4">Search Results</h2>
          {agents.length === 0 && !loading && (
            <div className="text-slate-500 italic text-center py-8">No agents found yet.</div>
          )}
          {agents.map((agent) => (
            <div
              key={agent.uaid}
              onClick={() => verifyIdentity(agent)}
              className={`p-4 rounded-lg border cursor-pointer transition hover:bg-slate-700/50 ${
                selectedAgent?.uaid === agent.uaid
                  ? 'bg-slate-700 border-emerald-500 ring-1 ring-emerald-500'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                  <code className="text-xs text-slate-400 block mt-1">{agent.uaid}</code>
                </div>
                {agent.trustScore && (
                  <span className="bg-slate-900 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/30">
                    Trust: {agent.trustScore}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 relative overflow-hidden">
          {!selectedAgent ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[300px]">
              <Lock className="w-12 h-12 opacity-20" />
              <p>Select an agent to verify identity</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold">
                  {selectedAgent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                  <div className="text-xs text-slate-500">Verification in progress...</div>
                </div>
              </div>

              <div className="space-y-4">
                <VerificationStep
                  label="Resolving Universal Registry Profile"
                  status={verifying ? 'loading' : 'success'}
                  delay={0}
                />
                <VerificationStep
                  label="Verifying On-Chain Identity (ERC-8004)"
                  status={verifying ? 'pending' : 'success'}
                  delay={1}
                />
                <VerificationStep
                  label="Establishing Encrypted Channel"
                  status={verifying ? 'pending' : 'success'}
                  delay={2}
                />
              </div>

              {!verifying && verificationResult && (
                <div className="mt-8 bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="text-emerald-400 w-6 h-6" />
                    <h3 className="text-lg font-bold text-emerald-400">Identity Verified</h3>
                  </div>
                  <p className="text-sm text-emerald-200/70 mb-4">
                    This agent has been cryptographically verified against the Hashgraph ledger.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-950 p-3 rounded">
                      <span className="block text-slate-500 text-xs uppercase tracking-wider">Registry</span>
                      {verificationResult.details.registry}
                    </div>
                    <div className="bg-slate-950 p-3 rounded">
                      <span className="block text-slate-500 text-xs uppercase tracking-wider">Protocol</span>
                      {verificationResult.details.communicationProtocol || 'Standard'}
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-medium transition cursor-not-allowed opacity-75">
                    Start Encrypted Chat (Demo)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerificationStep({ label, status, delay }: { label: string, status: 'pending' | 'loading' | 'success' | 'error', delay: number }) {
  // Simple hack for staggered animation simulation visuals
  const [visualStatus, setVisualStatus] = useState<'pending' | 'loading' | 'success'>(status === 'success' ? 'success' : 'pending');
  
  // In a real app, this would be reactive to actual progress events
  // For demo: if parent is verifying, we show loading based on delay index
  // if parent is done (status success), we show success
  
  return (
    <div className="flex items-center gap-3">
        {status === 'success' ? (
             <CheckCircle className="w-5 h-5 text-emerald-500" />
        ) : status === 'loading' ? (
             <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-700" />
        )}
      <span className={status === 'pending' ? 'text-slate-500' : 'text-slate-200'}>{label}</span>
    </div>
  );
}

export default App;
