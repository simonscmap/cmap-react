# Download Dialog

## Subset Controls

The subset controls allow the user to define a subset of the whole dataset, constrained by

- time
- latitude
- longitude
- depth

Each of these controls consists in a range slider, with corresponding text inputs.

The implementation uses `React.useState` for each parameter. These state declarations are made in the parent `dialog.js` and passed into the `SubsetControls` and from there into individual control components (`LatitudeSubsetControl`, etc.).

However, this means that any state that is set in the child will cause a rerender in the parent. This re-render caused a bug in which the input under focus would loose focus each re-render. Practically this made the text input unuseable, and the sliders would only slide one tick at a time.

The only solution to this is to declare the child components outside of the scope of the parents. The critical one is `SubsetControls`, and we pass a large number of parameters into it because it is declared out of the scope of the parent.

### Depth

The depth controls will only render if there is a `Depth_Max` and `Depth_Max` and `Depth_Min` are not the same value.

For example in Gradients4-TN397 the `Depth_Max` and `Depth_Min` are both `8`. This would confuse the `Slider` component: because the two slider handles are siblings who use their form value as keys, this would generate a warning that both children have the same key.
