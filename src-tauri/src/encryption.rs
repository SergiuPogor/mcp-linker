use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use ring::aead::{
    Aad, BoundKey, Nonce, NonceSequence, OpeningKey, SealingKey, UnboundKey, AES_256_GCM,
};
use ring::rand::{SecureRandom, SystemRandom};

// Custom nonce sequence using a single nonce
struct SingleNonceSequence(Nonce);

impl NonceSequence for SingleNonceSequence {
    fn advance(&mut self) -> Result<Nonce, ring::error::Unspecified> {
        Ok(Nonce::assume_unique_for_key(*self.0.as_ref()))
    }
}

#[tauri::command]
pub fn generate_encryption_key() -> String {
    let rng = SystemRandom::new();
    let mut key_bytes = [0u8; 32];
    rng.fill(&mut key_bytes).unwrap();
    BASE64.encode(key_bytes)
}

#[tauri::command]
pub fn encrypt_data(data: &str, key: &str) -> Result<String, String> {
    let key_bytes = BASE64.decode(key).map_err(|e| e.to_string())?;
    let unbound_key = UnboundKey::new(&AES_256_GCM, &key_bytes).map_err(|e| e.to_string())?;

    let rng = SystemRandom::new();
    let mut nonce_bytes = [0u8; 12];
    rng.fill(&mut nonce_bytes).map_err(|e| e.to_string())?;

    let nonce = Nonce::assume_unique_for_key(nonce_bytes);
    let mut in_out = data.as_bytes().to_vec();

    let mut sealing_key = SealingKey::new(unbound_key, SingleNonceSequence(nonce));
    sealing_key
        .seal_in_place_append_tag(Aad::empty(), &mut in_out)
        .map_err(|e| e.to_string())?;

    let mut combined = Vec::with_capacity(nonce_bytes.len() + in_out.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&in_out);

    Ok(BASE64.encode(combined))
}

#[tauri::command]
pub fn decrypt_data(encrypted_data: &str, key: &str) -> Result<String, String> {
    let key_bytes = BASE64.decode(key).map_err(|e| e.to_string())?;
    let unbound_key = UnboundKey::new(&AES_256_GCM, &key_bytes).map_err(|e| e.to_string())?;

    let combined = BASE64.decode(encrypted_data).map_err(|e| e.to_string())?;
    if combined.len() < 12 {
        return Err("Invalid encrypted data".to_string());
    }

    let (nonce_bytes, in_out) = combined.split_at(12);
    let nonce = Nonce::try_assume_unique_for_key(nonce_bytes).map_err(|e| e.to_string())?;

    let mut opening_key = OpeningKey::new(unbound_key, SingleNonceSequence(nonce));
    let mut in_out_vec = in_out.to_vec();
    let plaintext = opening_key
        .open_in_place(Aad::empty(), &mut in_out_vec)
        .map_err(|e| e.to_string())?;

    String::from_utf8(plaintext.to_vec()).map_err(|e| e.to_string())
}
