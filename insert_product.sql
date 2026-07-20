UPDATE app_state
SET data = json_insert(
  data,
  '$.products[#]',
  json('{"id":93000,"is_best_seller":false,"title":"SALDO API JagoPrem LLM","cashback_amount":0,"cashback_type":"amount","thumbnail":"favicon.svg","price":12300,"available_stock":999,"sold":0,"total_stock":999,"has_wholesale":false,"stock":49,"enabled":true,"featuredRank":2,"duration":"Pay-as-you-go","warranty":"Garansi saldo masuk","access":"API Key JagoPrem LLM","description":"Top-up saldo API JagoPrem LLM untuk mengakses 100+ model AI (GPT-4o, Claude, Gemini, DeepSeek, dll) melalui endpoint yang kompatibel OpenAI. Kurs tetap Rp12.300/. Akun dan API Key akan dibuatkan oleh admin setelah pembayaran dikonfirmasi.","autoRestock":false}')
)
WHERE id = 1;


