#!/usr/bin/fish

# Variables para configurar el host y puerto
set HOST "http://localhost/api"

# Función para imprimir encabezados de sección
function print_section
    set_color cyan
    echo "----------------------------------------"
    echo $argv
    set_color normal
end

# Función para manejar errores
function handle_error
    if test $status -ne 0
        set_color red
        echo "Error executing command: $argv"
        set_color normal
    end
end

# Limpiar archivos de respuesta previos
rm -f register_response.json login_response.json profile_response.json 2>/dev/null

# Pruebas de Registro
function test_register
    print_section "PRUEBA DE REGISTRO"
    
    # Registro exitoso
    curl -X POST $HOST/account/register \
        -H "Content-Type: application/json" \
        -d '{
            "email": "usuario_prueba@example.com", 
            "password": "PassWord123!", 
            "name": "Usuario de Prueba", 
            "phone": "+34612345678", 
            "address": "Calle Ejemplo 123", 
            "city": "Madrid"
        }' \
        -s -o register_response.json
    
    cat register_response.json | jq
end

# Pruebas de Login
function test_login
    print_section "PRUEBA DE LOGIN"
    
    # Login exitoso
    curl -X POST $HOST/account/login \
        -H "Content-Type: application/json" \
        -d '{
            "email": "usuario_prueba@example.com", 
            "password": "PassWord123!"
        }' \
        -s -o login_response.json
    
    cat login_response.json | jq
end

# Pruebas de Obtener Perfil
function test_get_profile
    print_section "PRUEBA DE OBTENER PERFIL"
    
    # Obtener perfil con ID de cuenta
    set ACCOUNT_ID (jq -r '.accountId' login_response.json)
    
    curl -X GET "$HOST/profile?accountId=$ACCOUNT_ID" \
        -H "Content-Type: application/json" \
        -s -o profile_response.json
    
    cat profile_response.json | jq
end

# Pruebas de Casos de Error
function test_error_cases
    print_section "PRUEBAS DE CASOS DE ERROR"
    
    # Registro con email duplicado
    echo "Registro con email duplicado:"
    curl -X POST $HOST/account/register \
        -H "Content-Type: application/json" \
        -d '{
            "email": "usuario_prueba@example.com", 
            "password": "PassWord123!", 
            "name": "Usuario de Prueba", 
            "phone": "+34612345678", 
            "address": "Calle Ejemplo 123", 
            "city": "Madrid"
        }' | jq
    
    echo -e "\nLogin con credenciales inválidas:"
    curl -X POST $HOST/account/login \
        -H "Content-Type: application/json" \
        -d '{
            "email": "usuario_prueba@example.com", 
            "password": "ClaveIncorrecta"
        }' | jq
    
    echo -e "\nObtener perfil con ID inválido:"
    curl -X GET "$HOST/profile?accountId=999999" | jq
end

# Ejecutar todas las pruebas
function run_all_tests
    test_register
    test_login
    test_get_profile
    test_error_cases
end

# Ejecutar pruebas
run_all_tests
