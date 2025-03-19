// js/auth.js
import { supabaseClient } from "./supabaseClient.js";

export async function registerUser() {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) {
    alert("Registration Error: " + error.message);
    return false;
  }
  alert("Registration successful!");
  return true;
}

export async function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    alert("Login Error: " + error.message);
    return false;
  }
  alert("Login successful!");
  return true;
}
