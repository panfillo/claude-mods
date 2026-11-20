# usage-meter

Mod per Claude Code che mostra sempre la percentuale di utilizzo del piano Claude:
una barra sopra il campo di scrittura con i limiti **5 ore**, **7 giorni** e il
riempimento del **contesto** (verde < 70%, giallo < 90%, rosso oltre), una voce
nella riga di stato e un avviso quando un limite supera il 90%. Le percentuali dei
limiti compaiono dopo la prima risposta della sessione.

## Installazione

Al prompt di una sessione Claude Code:

```
/plugin install usage-meter --marketplace panfillo/claude-mods
```

Rispondi `y` per aggiungere il marketplace, poi scegli l'ambito **user**.

Da shell:

```
claude plugin install usage-meter --marketplace panfillo/claude-mods
```

Nell'app desktop, dove `/plugin` non è disponibile: premi **+** accanto al prompt,
poi **Plugins**, **Add marketplace** con `panfillo/claude-mods`, poi **Add plugin**.
