def eliminar_lineas_repetidas(archivo_entrada, archivo_salida, archivo_log):
    lineas_vistas = set()
    lineas_unicas = []
    lineas_eliminadas = []
    
    with open(archivo_entrada, 'r', encoding='utf-8') as f:
        for linea in f:
            if linea not in lineas_vistas:
                lineas_vistas.add(linea)
                lineas_unicas.append(linea)
            else:
                lineas_eliminadas.append(linea)
    
    with open(archivo_salida, 'w', encoding='utf-8') as f:
        f.writelines(lineas_unicas)
    
    with open(archivo_log, 'w', encoding='utf-8') as f:
        f.writelines(lineas_eliminadas)

# Ejemplo de uso
eliminar_lineas_repetidas('facts.js', '2facts.js', 'eliminadas.log')