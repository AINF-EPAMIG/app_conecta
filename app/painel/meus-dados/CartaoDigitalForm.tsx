"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, Trash2 } from "lucide-react";
import Image from "next/image";

type CartaoDigital = {
  id: number;
  cpf: string;
  nome: string;
  email: string;
  cargo: string;
  foto: string | null;
  linkedin: string | null;
  whatsapp: string | null;
  instagram: string | null;
  lattes: string | null;
};

type CartaoDigitalFormProps = {
  user: {
    cpf: string;
    name?: string;
    email?: string;
    cargo?: string;
  };
  cartao: CartaoDigital | null;
  onSuccess: () => void;
  onCancel: () => void;
};

// Função utilitária: monta URL para exibir a foto
function getFotoUrl(foto: string | null): string {
  if (!foto) return "/sem-foto.jpg"; // Fallback padrão (coloque a imagem em /public/)

  // 1. Se for uma URL absoluta
  if (/^https?:\/\//i.test(foto)) return foto;

  // 2. Se vier um path absoluto (raro, mas seguro)
  if (foto.startsWith("/")) return foto;

  // 3. Usa a variável de ambiente BASE_FOTO_URL se disponível,
  //    senão, usa um path padrão local (ideal para localhost/dev)
  const base =
    (process.env.NEXT_PUBLIC_BASE_FOTO_URL?.replace(/\/?$/, "/")) ||
    "/quadro_funcionarios/web/fotos/";

  return `${base}${foto}`;
}


export default function CartaoDigitalForm({
  user,
  cartao,
  onSuccess,
  onCancel,
}: CartaoDigitalFormProps) {
  const [formData, setFormData] = useState({
    nome: cartao?.nome || user?.name || "",
    email: cartao?.email || user?.email || "",
    cargo: cartao?.cargo || user?.cargo || "",
    linkedin: cartao?.linkedin || "",
    whatsapp: cartao?.whatsapp || "",
    instagram: cartao?.instagram || "",
    lattes: cartao?.lattes || "",
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("/sem-foto.jpg");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza preview inicial vindo do banco (cartao)
  useEffect(() => {
    if (!foto) {
      setFotoPreview(cartao?.foto ? getFotoUrl(cartao.foto) : "/sem-foto.jpg");
    }
  }, [cartao, foto]);

  // Atualiza preview ao selecionar arquivo novo
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFotoPreview(ev.target?.result as string); // Preview local
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("cpf", user.cpf);
      formDataToSend.append("nome", formData.nome);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("cargo", formData.cargo);
      formDataToSend.append("linkedin", formData.linkedin);
      formDataToSend.append("whatsapp", formData.whatsapp);
      formDataToSend.append("instagram", formData.instagram);
      formDataToSend.append("lattes", formData.lattes);

      if (foto) {
        formDataToSend.append("foto", foto);
      }
      if (cartao) {
        formDataToSend.append("_method", "PUT");
      }

      const response = await fetch("/api/cartao-digital", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar cartão digital");
      }

      setFoto(null);
      onSuccess();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar cartão digital. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const removeFoto = () => {
    setFoto(null);
    setFotoPreview("/sem-foto.jpg");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Upload de Foto */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Foto do Perfil
        </label>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="relative group">
              <Image
                src={fotoPreview}
                alt="Preview"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-4 border-green-200 shadow-lg"
                unoptimized
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
                {fotoPreview !== "/sem-foto.jpg" && (
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Camera size={16} />
              {fotoPreview && fotoPreview !== "/sem-foto.jpg" ? "Trocar Foto" : "Adicionar Foto"}
            </button>
            {fotoPreview && fotoPreview !== "/sem-foto.jpg" && (
              <button
                type="button"
                onClick={removeFoto}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                Remover
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500 text-center">
            Formatos aceitos: JPG, PNG. Máximo 5MB
          </p>
        </div>
      </div>

      {/* Campos do Formulário */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
            placeholder="Digite seu nome completo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
            placeholder="seu.email@exemplo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cargo *
          </label>
          <input
            type="text"
            name="cargo"
            value={formData.cargo}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
            placeholder="Seu cargo atual"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
            placeholder="https://linkedin.com/in/seu-perfil"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
            placeholder=""
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram
          </label>
          <input
            type="text"
            name="instagram"
            value={formData.instagram}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
            placeholder="@seu_usuario"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lattes
          </label>
          <input
            type="url"
            name="lattes"
            value={formData.lattes}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
            placeholder="http://lattes.cnpq.br/..."
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Salvando...
            </>
          ) : cartao ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
}
