import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Crown, Sparkles, Shield, Cloud, Palette, Copy, QrCode, Building2 } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function Payment() {
  const [, setLocation] = useLocation();
  const t = useTranslation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "qris" | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const plans = [
    {
      id: "monthly",
      name: "Bulanan",
      price: "Rp 27.900",
      interval: "bulan",
      description: "Pilihan fleksibel untuk setiap bulan"
    },
    {
      id: "yearly",
      name: "Tahunan",
      price: "Rp 279.000",
      interval: "tahun",
      description: "Hemat 2 bulan dengan langganan tahunan"
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSelectMethod = (method: "transfer" | "qris") => {
    setPaymentMethod(method);
    setShowInstructions(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Berhasil disalin",
      description: `${label} telah disalin ke papan klip.`,
    });
  };

  const handleConfirmPayment = () => {
    setPaymentSuccess(true);
    setShowInstructions(false);
  };

  const features = [
    { icon: Palette, text: "Exclusive Pipo Themes" },
    { icon: Cloud, text: "Unlimited Cloud Storage" },
    { icon: Shield, text: "Priority Support" },
    { icon: Sparkles, text: "Advanced AI Features" },
  ];

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Konfirmasi Terkirim!</h1>
          <p className="text-gray-600 mb-6">
            Tim kami akan memverifikasi pembayaran Anda segera. Akun Premium Anda akan aktif dalam waktu maksimal 1 jam.
          </p>
          <Button
            onClick={() => setLocation("/menu")}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-8"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (showInstructions) {
      setShowInstructions(false);
      setPaymentMethod(null);
    } else if (selectedPlan) {
      setSelectedPlan(null);
    } else {
      setLocation("/menu");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-12">
      <div className="max-w-md mx-auto px-4 py-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 btn-press"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{showInstructions ? "Ganti Metode" : selectedPlan ? "Ganti Paket" : "Back"}</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pipo Premium</h1>
          <p className="text-gray-600">
            {showInstructions ? (paymentMethod === "transfer" ? "Instruksi Transfer" : "Instruksi QRIS") : selectedPlan ? "Pilih Metode Pembayaran" : "Buka fitur eksklusif Pipo"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(99,102,241,0.15)' }}>
          {!selectedPlan ? (
            <>
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">{feature.text}</span>
                    <Check className="w-5 h-5 text-green-500 ml-auto" />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left btn-press"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-bold text-gray-900">{plan.name}</p>
                        <p className="text-xs text-gray-500">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-indigo-600">{plan.price}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">/{plan.interval}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : !showInstructions ? (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-2">
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-1">Paket Terpilih</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-900">{plans.find(p => p.id === selectedPlan)?.name}</p>
                  <p className="font-black text-indigo-700">{plans.find(p => p.id === selectedPlan)?.price}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleSelectMethod("transfer")}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left flex items-center gap-4 btn-press"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Transfer Bank</p>
                    <p className="text-xs text-gray-500">BCA, Mandiri, BNI, dll</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMethod("qris")}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left flex items-center gap-4 btn-press"
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">QRIS</p>
                    <p className="text-xs text-gray-500">GoPay, OVO, Dana, ShopeePay</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-2">
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-1">Total Pembayaran</p>
                <p className="text-2xl font-black text-indigo-700">
                  {plans.find(p => p.id === selectedPlan)?.price}
                </p>
              </div>

              {paymentMethod === "transfer" ? (
                <div className="p-4 border border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-sm">Transfer Bank (BCA)</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <code className="text-indigo-600 font-mono font-bold">1234567890</code>
                    <button 
                      onClick={() => copyToClipboard("1234567890", "Nomor Rekening")}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Atas Nama: PT PIPO TEKNOLOGI INDONESIA</p>
                </div>
              ) : (
                <div className="p-4 border border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-pink-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-sm">QRIS (Semua Bank/E-Wallet)</p>
                  </div>
                  <div className="aspect-square w-48 mx-auto bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden p-4">
                    <div className="w-full h-full border-4 border-indigo-600/20 border-dashed rounded-lg flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-indigo-200" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Badge className="bg-indigo-600 text-white border-none font-bold">QRIS PIPO</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-gray-400 mt-3 italic">Scan kode di atas menggunakan m-Banking atau E-Wallet Anda</p>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  onClick={handleConfirmPayment}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-base shadow-lg"
                >
                  Saya Sudah Bayar
                </Button>
                <p className="text-[10px] text-center text-gray-400 mt-3">
                  Setelah klik tombol, tim kami akan memproses verifikasi manual.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px]">
          <Shield className="w-3 h-3" />
          <span>Pembayaran Aman & Terenkripsi</span>
        </div>
      </div>
    </div>
  );
}
