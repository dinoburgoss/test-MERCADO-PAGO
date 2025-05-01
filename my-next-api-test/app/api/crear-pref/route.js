import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { uid, items, back_urls } = body;

    if (!uid || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Datos inválidos' }), {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const ref = doc(db, 'comercios', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return new Response(JSON.stringify({ error: 'Comercio no encontrado' }), {
        status: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const comercio = snap.data();

    if (!comercio.mpAccessToken) {
      return new Response(JSON.stringify({ error: 'Token de Mercado Pago no configurado' }), {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${comercio.mpAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        back_urls,
        auto_return: 'approved',
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify({ id: data.id }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Error interno:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
